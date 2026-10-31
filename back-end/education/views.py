from rest_framework import viewsets, status, generics, permissions, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Test, Question, Choice, TestSubmission, StudentResponse, StudentProfile, Lecture, Group
from .serializers import TestSerializer, TestListSerializer, TestSubmitSerializer, LectureSerializer, TestSubmissionSerializer, RegisterSerializer, QuestionSerializer, ChoiceSerializer
from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from collections import Counter
import socket
from .answers import answers_match

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class SubmitTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TestSubmitSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            test_id = data['test_id']
            test = get_object_or_404(Test, id=test_id)

            student, _ = StudentProfile.objects.get_or_create(user=request.user)

            submission = TestSubmission.objects.create(
                student=student,
                test=test,
                score=0
            )

            correct_count = 0
            questions = list(test.questions.all().order_by('id'))
            total_questions = len(questions)
            answers_by_question = {a['question_id']: a for a in data['answers']}
            details = []

            for question in questions:
                answer = answers_by_question.get(question.id, {})
                selected_choice = None
                is_correct = False
                text_answer = answer.get('text_answer')

                if question.q_type == 'CHOICE':
                    selected_choice_id = answer.get('selected_choice_id')
                    if selected_choice_id:
                        selected_choice = question.choices.filter(id=selected_choice_id).first()
                        is_correct = bool(selected_choice and selected_choice.is_correct)
                    correct_choice = question.choices.filter(is_correct=True).first()
                    correct_answer = correct_choice.text if correct_choice else ''
                    user_answer = selected_choice.text if selected_choice else ''
                else:
                    is_correct = answers_match(text_answer, question.correct_text_answer)
                    correct_answer = question.correct_text_answer or ''
                    user_answer = text_answer or ''

                if is_correct:
                    correct_count += 1

                if answer:
                    StudentResponse.objects.create(
                        submission=submission,
                        question=question,
                        selected_choice=selected_choice,
                        text_answer=text_answer,
                        is_correct=is_correct
                    )

                details.append({
                    'question_id': question.id,
                    'is_correct': is_correct,
                    'user_answer': user_answer,
                    'correct_answer': correct_answer,
                })

            final_score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
            submission.score = final_score
            submission.save()

            return Response({
                "message": "Тест завершён!",
                "score": final_score,
                "correct_count": correct_count,
                "total": total_questions,
                "details": details
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherResultsView(generics.ListAPIView):
    queryset = TestSubmission.objects.all().order_by('-submitted_at')
    serializer_class = TestSubmissionSerializer
    permission_classes = [IsAdminUser]  # Только учителя (is_staff=True)


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all().order_by('id')
    serializer_class = LectureSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

    def get_permissions(self):
        # Если кто-то хочет создать или удалить (POST, DELETE, PUT) — только админ/учитель
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAdminUser()]
        # Список и отдельный тест доступны любому вошедшему пользователю.
        # Правильные ответы сериализатор отдаёт только учителю.
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'list':
            return TestListSerializer
        return TestSerializer

    def get_queryset(self):
        return Test.objects.all().order_by('series', 'variant', 'id')



    def create(self, request, *args, **kwargs):
        data = request.data
        questions_data = data.pop('questions', [])
        # Извлекаем ID лекции из данных, которые прислал React
        lecture_id = data.pop('related_lecture', None)

        try:
            with transaction.atomic():
                # 1. Создаем тест
                test = Test.objects.create(
                    title=data.get('title'),
                    description=data.get('description', ''),
                    series=data.get('series') or '',
                    variant=data.get('variant') or None
                )

                # 2. ПРИВЯЗКА К ЛЕКЦИИ (Делаем это здесь, на сервере)
                if lecture_id:
                    # Ищем лекцию. Если нашли — обновляем поле related_test
                    Lecture.objects.filter(id=lecture_id).update(related_test=test)
                    print(f"Тест {test.id} успешно привязан к лекции {lecture_id}")

                # 3. Создаем вопросы и варианты (твой старый код)
                for q_item in questions_data:
                    choices_data = q_item.pop('choices', [])
                    question = Question.objects.create(
                        test=test,
                        text=q_item.get('text'),
                        q_type=q_item.get('q_type', 'CHOICE'),
                        correct_text_answer=q_item.get('correct_text_answer') or None
                    )
                    for c_item in choices_data:
                        Choice.objects.create(
                            question=question,
                            text=c_item.get('text'),
                            is_correct=c_item.get('is_correct', False)
                        )

                serializer = self.get_serializer(test)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Ошибка при создании: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Исправленная строка (убрали звездочку перед pk или убрали =None)
    def update(self, request, pk=None, **kwargs):
        test = self.get_object()
        data = request.data

        with transaction.atomic():
            # 1. Обновляем основные поля теста
            test.title = data.get('title', test.title)
            test.description = data.get('description', test.description)
            test.series = data.get('series', test.series) or ''
            test.variant = data.get('variant', test.variant) or None
            test.save()

            # 2. Удаляем старые вопросы (Choice удалятся каскадно)
            test.questions.all().delete()

            # 3. Создаем новые вопросы из присланных данных
            for q_data in data.get('questions', []):
                question = Question.objects.create(
                    test=test,
                    text=q_data['text'],
                    q_type=q_data.get('q_type', 'CHOICE'),
                    correct_text_answer=q_data.get('correct_text_answer') or None
                )
                for c_data in q_data.get('choices', []):
                    Choice.objects.create(
                        question=question,
                        text=c_data['text'],
                        is_correct=c_data['is_correct']
                    )

            # 4. Привязка к лекции (если передана)
            if 'lecture_id' in data:
                Lecture.objects.filter(related_test=test).update(related_test=None)
                if data.get('lecture_id'):
                    Lecture.objects.filter(id=data['lecture_id']).update(related_test=test)

        serializer = self.get_serializer(test)
        return Response(serializer.data)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'full_name': request.user.get_full_name(),
            'is_teacher': request.user.is_staff
        })


class MyResultsView(generics.ListAPIView):
    """История попыток текущего ученика."""
    serializer_class = TestSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (TestSubmission.objects
                .filter(student__user=self.request.user)
                .select_related('test')
                .order_by('-submitted_at'))


class GroupListView(generics.ListAPIView):
    queryset = Group.objects.all()
    # Убираем строку serializer_class = serializers.SerializerMethodField()

    def get_serializer_class(self):
        # Оставляем определение внутри или выносим в serializers.py
        class GroupSerializer(serializers.ModelSerializer):
            class Meta:
                model = Group
                fields = ['id', 'name']
        return GroupSerializer


class SubmissionDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        submission = get_object_or_404(TestSubmission, id=pk)
        responses = StudentResponse.objects.filter(submission=submission).select_related('question', 'selected_choice')

        def correct_answer(question):
            if question.q_type == 'CHOICE':
                right = question.choices.filter(is_correct=True).first()
                return right.text if right else ''
            return question.correct_text_answer or ''

        data = {
            'student_name': submission.student.user.get_full_name() or "—",
            'group_name': submission.student.group.name if submission.student.group else "—",
            'test_title': submission.test.title,
            'score': submission.score,
            'responses': [
                {
                    'question_text': r.question.text,
                    'user_answer': r.selected_choice.text if r.selected_choice else r.text_answer,
                    'correct_answer': correct_answer(r.question),
                    'is_correct': r.is_correct,
                } for r in responses
            ]
        }
        return Response(data)

    def delete(self, request, pk):
        try:
            submission = TestSubmission.objects.get(pk=pk)
            submission.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TestSubmission.DoesNotExist:
            return Response({"error": "Результат не найден"}, status=status.HTTP_404_NOT_FOUND)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAdminUser] # Чтобы только учителя могли создавать

class ChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer # Сейчас создадим его
    permission_classes = [IsAdminUser]

class TestStatsView(APIView):
    """Статистика по каждой задаче теста: какие решают хуже всего и где чаще ошибаются."""
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        test = get_object_or_404(Test, pk=pk)
        submissions = TestSubmission.objects.filter(test=test)
        attempts = submissions.count()
        average = round(sum(s.score for s in submissions) / attempts) if attempts else 0

        questions = []
        for number, question in enumerate(test.questions.order_by('id'), start=1):
            responses = StudentResponse.objects.filter(question=question, submission__test=test).select_related('selected_choice')
            correct = sum(1 for r in responses if r.is_correct)
            answered = len(responses)

            wrong = Counter()
            for r in responses:
                if r.is_correct:
                    continue
                answer = r.selected_choice.text if r.selected_choice else (r.text_answer or '').strip()
                if answer:
                    wrong[answer] += 1

            if question.q_type == 'CHOICE':
                right = question.choices.filter(is_correct=True).first()
                correct_answer = right.text if right else ''
            else:
                correct_answer = question.correct_text_answer or ''

            questions.append({
                'id': question.id,
                'number': number,
                'text': question.text,
                'correct_answer': correct_answer,
                'correct': correct,
                'answered': answered,
                'skipped': attempts - answered,
                'rate': round(correct / attempts * 100) if attempts else None,
                'common_wrong': [{'answer': a, 'count': c} for a, c in wrong.most_common(3)],
            })

        return Response({
            'id': test.id,
            'title': test.title,
            'attempts': attempts,
            'average': average,
            'questions': questions,
        })


class LeaderboardView(APIView):
    """Живой рейтинг для режима конференции: лучший результат каждого участника.

    ?tests=11,12,13,14 — какие тесты учитывать, ?since=ISO-время — только попытки после начала сессии.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        ids = [int(x) for x in request.query_params.get('tests', '').split(',') if x.strip().isdigit()]
        submissions = (TestSubmission.objects
                       .filter(test_id__in=ids)
                       .select_related('student__user', 'student__group', 'test')
                       .order_by('submitted_at'))
        since = parse_datetime(request.query_params.get('since') or '')
        if since:
            submissions = submissions.filter(submitted_at__gte=since)

        best = {}
        for s in submissions:
            if s.student_id not in best or s.score > best[s.student_id].score:
                best[s.student_id] = s

        # При равных баллах выше тот, кто сдал раньше
        rows = sorted(best.values(), key=lambda s: (-s.score, s.submitted_at))
        return Response({
            'participants': len(rows),
            'rows': [{
                'name': s.student.user.get_full_name() or s.student.user.username,
                'group': s.student.group.name if s.student.group else '',
                'score': s.score,
                'variant': s.test.variant,
                'submitted_at': s.submitted_at,
            } for s in rows],
        })


class NetworkInfoView(APIView):
    """IP компьютера в локальной сети — чтобы QR-код открывался с телефонов."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        lan_ip = None
        try:
            # UDP-сокет ничего не отправляет, но показывает, через какой интерфейс идёт трафик
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(('8.8.8.8', 80))
                lan_ip = s.getsockname()[0]
        except OSError:
            pass
        return Response({'lan_ip': lan_ip})
