from django.db import models
from django.contrib.auth.models import User


# --- ПОЛЬЗОВАТЕЛИ И ГРУППЫ ---

class Group(models.Model):
    name = models.CharField("Название группы (клacc)", max_length=50)

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, related_name='students')
    phone = models.CharField("Номер телефона", max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.last_name} {self.user.first_name}"


# --- КОНТЕНТ (ТЕСТЫ И ВОПРОСЫ) ---

class Test(models.Model):
    title = models.CharField("Название теста", max_length=255)
    description = models.TextField("Описание темы", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPES = (
        ('CHOICE', 'Выбор варианта'),
        ('TEXT', 'Ввод текста'),
    )
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField("Текст вопроса")
    q_type = models.CharField("Тип вопроса", max_length=10, choices=QUESTION_TYPES, default='CHOICE')
    # Это поле нужно только если тип вопроса TEXT
    correct_text_answer = models.CharField("Правильный ответ (текстом)", max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.test.title} | {self.text[:30]}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField("Вариант ответа", max_length=255)
    is_correct = models.BooleanField("Это правильный ответ?", default=False)

    def __str__(self):
        return self.text


# --- РЕЗУЛЬТАТЫ (ДЛЯ УЧИТЕЛЯ) ---

class TestSubmission(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='submissions')
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.IntegerField("Баллы/Процент", default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.test.title} ({self.score})"


class StudentResponse(models.Model):
    submission = models.ForeignKey(TestSubmission, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)


    selected_choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True, blank=True)
    text_answer = models.CharField("Введенный текст", max_length=255, blank=True, null=True)

    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Ответ на {self.question.text[:20]}"


class Lecture(models.Model):
    title = models.CharField("Название лекции", max_length=255)
    slug = models.SlugField("URL-имя (например, topic-1)", unique=True)
    image_url = models.CharField("Путь к картинке", max_length=500, default="/images/default.jpg")


    related_test = models.ForeignKey(
        'Test',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Связанный тест",
        related_name="lectures"
    )

    def __str__(self):
        return self.title