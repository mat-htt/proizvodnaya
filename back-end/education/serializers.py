from rest_framework import serializers
from .models import Test, Question, Choice, Lecture, TestSubmission, User, Group, StudentProfile



class RegisterSerializer(serializers.ModelSerializer):
    # Убираем поля first_name и last_name, оставляем только username и password
    group_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'group_id') # Только логин, пароль и группа
        extra_kwargs = {'password': {'write_only': True}}

    # Метод validate больше не нужен, так как мы не проверяем имена

    def create(self, validated_data):
        # Логика создания пользователя стала проще
        group_id = validated_data.pop('group_id', None)

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
            # Не передаем first_name и last_name
        )

        # Профиль создается автоматически сигналом post_save в models.py
        # Нам нужно только обновить группу, если она передана
        if group_id:
            try:
                profile = user.student_profile
                profile.group = Group.objects.get(id=group_id)
                profile.save()
            except Group.DoesNotExist:
                pass # группа не найдена — оставляем без группы

        return user


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
    # ТЕПЕРЬ ДОСТАЕМ ИМЕННО USERNAME
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    group_name = serializers.CharField(source='student.group.name', read_only=True, allow_null=True)
    test_title = serializers.CharField(source='test.title', read_only=True)

    class Meta:
        model = TestSubmission
        fields = ['id', 'student_name', 'group_name', 'test_title', 'score', 'submitted_at']