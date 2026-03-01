from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Test, Question, Choice, TestSubmission, StudentResponse, StudentProfile, Lecture
from .serializers import TestSerializer, TestSubmitSerializer, LectureSerializer

class TestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

class LectureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer


class SubmitTestView(APIView):
    def post(self, request):
        serializer = TestSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        test = Test.objects.get(id=data['test_id'])

        # В реальном проекте берем из request.user.student_profile
        # Для теста возьмем первого попавшегося студента или создай его в админке
        student = StudentProfile.objects.first()

        correct_count = 0
        total_questions = test.questions.count()

        # Создаем запись о попытке
        submission = TestSubmission.objects.create(
            student=student,
            test=test,
            score=0  # Обновим в конце
        )

        for answer_data in data['answers']:
            question = Question.objects.get(id=answer_data['question_id'])
            is_correct = False

            if question.q_type == 'CHOICE':
                choice = Choice.objects.get(id=answer_data['selected_choice_id'])
                if choice.is_correct:
                    is_correct = True
                    correct_count += 1

                StudentResponse.objects.create(
                    submission=submission,
                    question=question,
                    selected_choice=choice,
                    is_correct=is_correct
                )

            elif question.q_type == 'TEXT':
                user_text = answer_data['text_answer'].strip().lower()
                correct_text = question.correct_text_answer.strip().lower()
                if user_text == correct_text:
                    is_correct = True
                    correct_count += 1

                StudentResponse.objects.create(
                    submission=submission,
                    question=question,
                    text_answer=answer_data['text_answer'],
                    is_correct=is_correct
                )

        # Считаем итоговый процент (оценку)
        score_percentage = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
        submission.score = score_percentage
        submission.save()

        return Response({
            "status": "success",
            "score": score_percentage,
            "correct_answers": correct_count,
            "total_questions": total_questions
        })