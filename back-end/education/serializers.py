from rest_framework import serializers
from .models import Test, Question, Choice, Lecture, TestSubmission

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True) # Подтягиваем варианты ответов сразу

    class Meta:
        model = Question
        fields = ['id', 'text', 'q_type', 'choices']

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ['id', 'title', 'description', 'questions']

class AnswerItemSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    # Может быть либо ID варианта, либо строка текста
    selected_choice_id = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_null=True, allow_blank=True)

class TestSubmitSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    answers = AnswerItemSerializer(many=True)



class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = ['id', 'title', 'slug', 'image_url', 'content', 'video_url', 'related_test']


class TestSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.__str__', read_only=True)
    group_name = serializers.CharField(source='student.group.name', read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)

    class Meta:
        model = TestSubmission
        fields = ['id', 'student_name', 'group_name', 'test_title', 'score', 'submitted_at']