from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Test, Question, Choice, TestSubmission, StudentResponse, StudentProfile, Lecture
from .serializers import TestSerializer, TestSubmitSerializer, LectureSerializer, TestSubmissionSerializer, RegisterSerializer
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from django.contrib.auth.models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class TeacherResultsView(generics.ListAPIView):
    # Этот вид будет отдавать результаты, которые учитель увидит в таблице
    queryset = TestSubmission.objects.all().order_by('-submitted_at')
    serializer_class = TestSubmissionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        group_id = self.request.query_params.get('group_id')
        if group_id:
            # Фильтруем результаты только для конкретной группы
            queryset = queryset.filter(student__group_id=group_id)
        return queryset

class TestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

class LectureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    lookup_field = 'slug'           # ← это ключевое
    lookup_url_kwarg = 'slug'       # можно и без, но лучше явно


class SubmitTestView(APIView):
    def post(self, request):
        serializer = TestSubmitSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            test_obj = Test.objects.get(id=data['test_id'])

            # Пока у нас нет полноценной авторизации, берем первого студента из базы
            # (Позже мы заменим это на request.user.student_profile)
            student = request.user.student_profile

            submission = TestSubmission.objects.create(
                student=student,
                test=test_obj,
                score=0
            )

            correct_answers_count = 0
            total_questions = test_obj.questions.count()

            for answer in data['answers']:
                question = Question.objects.get(id=answer['question_id'])
                is_correct = False
                selected_choice = None

                if question.q_type == 'CHOICE':
                    selected_choice = Choice.objects.get(id=answer['selected_choice_id'])
                    if selected_choice.is_correct:
                        is_correct = True
                        correct_answers_count += 1

                elif question.q_type == 'TEXT':
                    # Сравниваем текст (убираем пробелы и приводим к нижнему регистру)
                    if answer['text_answer'].strip().lower() == question.correct_text_answer.strip().lower():
                        is_correct = True
                        correct_answers_count += 1

                # Сохраняем каждый ответ ученика в базу
                StudentResponse.objects.create(
                    submission=submission,
                    question=question,
                    selected_choice=selected_choice if question.q_type == 'CHOICE' else None,
                    text_answer=answer.get('text_answer'),
                    is_correct=is_correct
                )

            # Вычисляем процент правильных ответов
            final_score = int((correct_answers_count / total_questions) * 100) if total_questions > 0 else 0
            submission.score = final_score
            submission.save()

            return Response({
                "message": "Тест завершен!",
                "score": final_score,
                "correct_count": correct_answers_count,
                "total": total_questions
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)