from rest_framework import viewsets, status, generics, permissions, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Test, Question, Choice, TestSubmission, StudentResponse, StudentProfile, Lecture, Group
from .serializers import TestSerializer, TestSubmitSerializer, LectureSerializer, TestSubmissionSerializer, RegisterSerializer, QuestionSerializer, ChoiceSerializer
from django.contrib.auth.models import User
from django.db import transaction

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
            test = Test.objects.get(id=test_id)

            student = request.user.student_profile

            submission = TestSubmission.objects.create(
                student=student,
                test=test,
                score=0
            )

            correct_count = 0
            total_questions = len(test.questions.all())

            for answer in data['answers']:
                question = Question.objects.get(id=answer['question_id'])
                selected_choice = None
                is_correct = False

                if question.q_type == 'CHOICE':
                    selected_choice_id = answer.get('selected_choice_id')
                    if selected_choice_id:
                        selected_choice = Choice.objects.get(id=selected_choice_id)
                        is_correct = selected_choice.is_correct
                        if is_correct:
                            correct_count += 1

                elif question.q_type == 'TEXT':
                    text_answer = answer.get('text_answer', '').strip().lower()
                    correct_text = question.correct_text_answer.strip().lower() if question.correct_text_answer else ''
                    if text_answer == correct_text:
                        is_correct = True
                        correct_count += 1

                StudentResponse.objects.create(
                    submission=submission,
                    question=question,
                    selected_choice=selected_choice,
                    text_answer=answer.get('text_answer'),
                    is_correct=is_correct
                )

            final_score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
            submission.score = final_score
            submission.save()

            return Response({
                "message": "Тест завершён!",
                "score": final_score,
                "correct_count": correct_count,
                "total": total_questions
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherResultsView(generics.ListAPIView):
    queryset = TestSubmission.objects.all().order_by('-submitted_at')
    serializer_class = TestSubmissionSerializer
    permission_classes = [IsAdminUser]  # Только учителя (is_staff=True)


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    lookup_field = 'slug'


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

    def get_permissions(self):
        # Если кто-то хочет создать или удалить (POST, DELETE, PUT) — только админ/учитель
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAdminUser()]
        # Для простого просмотра списка (list) в панели управления тоже ставим учителя
        if self.action == 'list':
            return [IsAdminUser()]
        # А вот отдельный тест (retrieve) ученик может открыть (когда проходит его)
        return [IsAuthenticated()]



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
                    description=data.get('description', '')
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
                        q_type=q_item.get('q_type', 'CHOICE')
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
    def update(self, request, pk=None):
        test = self.get_object()
        data = request.data

        with transaction.atomic():
            # 1. Обновляем основные поля теста
            test.title = data.get('title', test.title)
            test.description = data.get('description', test.description)
            test.save()

            # 2. Удаляем старые вопросы (Choice удалятся каскадно)
            test.questions.all().delete()

            # 3. Создаем новые вопросы из присланных данных
            for q_data in data.get('questions', []):
                question = Question.objects.create(
                    test=test,
                    text=q_data['text'],
                    q_type=q_data.get('q_type', 'CHOICE')
                )
                for c_data in q_data.get('choices', []):
                    Choice.objects.create(
                        question=question,
                        text=c_data['text'],
                        is_correct=c_data['is_correct']
                    )

            # 4. Привязка к лекции (если передана)
            lecture_id = data.get('lecture_id')
            if lecture_id:
                Lecture.objects.filter(related_test=test).update(related_test=None)
                Lecture.objects.filter(id=lecture_id).update(related_test=test)

        serializer = self.get_serializer(test)
        return Response(serializer.data)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'is_teacher': request.user.is_staff
        })


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
        submission = TestSubmission.objects.get(id=pk)
        responses = StudentResponse.objects.filter(submission=submission).select_related('question')

        data = {
            'student_name': submission.student.user.get_full_name() or "—",
            'group_name': submission.student.group.name if submission.student.group else "—",
            'score': submission.score,
            'responses': [
                {
                    'question_text': r.question.text,
                    'user_answer': r.selected_choice.text if r.selected_choice else r.text_answer,
                    'correct_answer': r.question.correct_text_answer or (r.question.choices.filter(is_correct=True).first().text if r.question.q_type == 'CHOICE' else ""),
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