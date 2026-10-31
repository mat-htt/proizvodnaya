"""Демо-данные для показа платформы: учителя, ученики по группам и их попытки.

Запуск:  python manage.py seed_demo_data

Команду можно запускать повторно: демо-пользователи пересоздаются с теми же
логинами и паролями, их старые попытки удаляются. Реальные пользователи не трогаются.
Логины и пароли — в DEMO_ACCOUNTS.md в корне проекта.
"""
import random
from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from education.answers import answers_match
from education.models import Group, StudentProfile, StudentResponse, Test, TestSubmission

STUDENT_PASSWORD = 'Student2026!'
TEACHER_PASSWORD = 'Teacher2026!'

TEACHERS = [
    ('teacher.ivanova', 'Ирина', 'Иванова'),
    ('teacher.petrov', 'Алексей', 'Петров'),
]

GROUPS = {
    '5k9391': [
        ('anna.smirnova', 'Анна', 'Смирнова', 0.92),
        ('dmitry.kozlov', 'Дмитрий', 'Козлов', 0.78),
        ('maria.novikova', 'Мария', 'Новикова', 0.85),
        ('ilya.morozov', 'Илья', 'Морозов', 0.55),
        ('sofia.volkova', 'София', 'Волкова', 0.70),
        ('artem.lebedev', 'Артём', 'Лебедев', 0.40),
        ('polina.sokolova', 'Полина', 'Соколова', 0.88),
        ('kirill.popov', 'Кирилл', 'Попов', 0.62),
    ],
    '5k9393': [
        ('egor.vasiliev', 'Егор', 'Васильев', 0.74),
        ('daria.fedorova', 'Дарья', 'Фёдорова', 0.95),
        ('nikita.mikhailov', 'Никита', 'Михайлов', 0.48),
        ('alisa.pavlova', 'Алиса', 'Павлова', 0.81),
        ('maxim.semenov', 'Максим', 'Семёнов', 0.66),
        ('ksenia.golubeva', 'Ксения', 'Голубева', 0.58),
        ('roman.vinogradov', 'Роман', 'Виноградов', 0.35),
        ('veronika.bogdanova', 'Вероника', 'Богданова', 0.77),
    ],
    '5k9396': [
        ('timur.kuznetsov', 'Тимур', 'Кузнецов', 0.69),
        ('elizaveta.orlova', 'Елизавета', 'Орлова', 0.90),
        ('matvey.zaitsev', 'Матвей', 'Зайцев', 0.52),
        ('viktoria.makarova', 'Виктория', 'Макарова', 0.83),
        ('denis.nikolaev', 'Денис', 'Николаев', 0.44),
        ('ulyana.andreeva', 'Ульяна', 'Андреева', 0.73),
        ('gleb.zakharov', 'Глеб', 'Захаров', 0.60),
        ('vasilisa.romanova', 'Василиса', 'Романова', 0.86),
    ],
}

# Насколько трудна каждая задача итогового тестирования (1 — легко, меньше — труднее)
FINAL_EASE = [0.97, 0.9, 0.9, 0.85, 0.7, 0.8, 0.5, 0.45, 0.55, 0.45]


def typical_mistake(correct, rng):
    """Правдоподобный неверный ответ: потерянный минус, ошибка на единицу, лишняя степень."""
    if '/' in correct:
        num, den = correct.replace('-', '').split('/')
        return rng.choice([f'{num}/{den}', f'-1/{int(den) ** 0.5:.0f}', f'-2/{den}'])
    try:
        n = int(correct)
    except ValueError:
        return correct + '0'
    return str(rng.choice([n + 1, n - 1, -n, n * 2, n + 2]))


class Command(BaseCommand):
    help = 'Наполняет базу демо-учителями, учениками и их результатами'

    def add_arguments(self, parser):
        parser.add_argument('--seed', type=int, default=2026, help='зерно генератора (для одинакового результата)')

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(options['seed'])
        if not Test.objects.filter(series__startswith='Итоговое').exists():
            call_command('seed_control_tests', stdout=self.stdout)

        final_tests = list(Test.objects.filter(series__startswith='Итоговое').order_by('variant'))
        lecture_tests = [t for t in Test.objects.filter(series='').exclude(lectures=None) if t.questions.exists()]
        now = timezone.now()

        for username, first, last in TEACHERS:
            user = self._user(username, first, last, TEACHER_PASSWORD, staff=True)
            self.stdout.write(f'Учитель: {user.get_full_name()} ({username})')

        total_attempts = 0
        for group_name, students in GROUPS.items():
            group, _ = Group.objects.get_or_create(name=group_name)
            for username, first, last, skill in students:
                user = self._user(username, first, last, STUDENT_PASSWORD)
                profile, _ = StudentProfile.objects.get_or_create(user=user)
                profile.group = group
                profile.save()
                TestSubmission.objects.filter(student=profile).delete()

                # 1–2 попытки итогового тестирования: вторая обычно лучше первой
                attempts = 2 if rng.random() < 0.45 else 1
                for n in range(attempts):
                    test = rng.choice(final_tests)
                    when = now - timedelta(days=rng.randint(1, 20), hours=rng.randint(0, 10), minutes=rng.randint(0, 59))
                    self._attempt(profile, test, min(0.98, skill + 0.08 * n), when, rng, FINAL_EASE)
                    total_attempts += 1

                # Тесты к лекциям — проходит большинство
                for test in lecture_tests:
                    if rng.random() < 0.7:
                        when = now - timedelta(days=rng.randint(10, 35), hours=rng.randint(0, 10))
                        self._attempt(profile, test, min(0.98, skill + 0.1), when, rng)
                        total_attempts += 1

        students = sum(len(s) for s in GROUPS.values())
        self.stdout.write(self.style.SUCCESS(
            f'Готово: учителей — {len(TEACHERS)}, учеников — {students} в {len(GROUPS)} группах, попыток — {total_attempts}'))

    def _user(self, username, first, last, password, staff=False):
        user, _ = User.objects.get_or_create(username=username)
        user.first_name, user.last_name, user.is_staff = first, last, staff
        user.set_password(password)
        user.save()
        StudentProfile.objects.get_or_create(user=user)
        return user

    def _attempt(self, profile, test, skill, when, rng, ease=None):
        questions = list(test.questions.order_by('id'))
        submission = TestSubmission.objects.create(student=profile, test=test, score=0)
        correct = 0
        for i, q in enumerate(questions):
            if rng.random() < 0.04:
                continue  # пропустил задачу
            p = (ease[i] if ease and i < len(ease) else 0.85) * (0.45 + 0.6 * skill)
            right = rng.random() < min(p, 0.98)
            if q.q_type == 'CHOICE':
                choices = list(q.choices.all())
                good = [c for c in choices if c.is_correct]
                bad = [c for c in choices if not c.is_correct]
                choice = (good or choices)[0] if right or not bad else rng.choice(bad)
                is_correct = choice.is_correct
                StudentResponse.objects.create(submission=submission, question=q, selected_choice=choice, is_correct=is_correct)
            else:
                answer = q.correct_text_answer if right else typical_mistake(q.correct_text_answer or '0', rng)
                is_correct = answers_match(answer, q.correct_text_answer)
                StudentResponse.objects.create(submission=submission, question=q, text_answer=answer, is_correct=is_correct)
            correct += is_correct
        score = int(correct / len(questions) * 100) if questions else 0
        # submitted_at заполняется автоматически, поэтому дату ставим отдельным запросом
        TestSubmission.objects.filter(pk=submission.pk).update(score=score, submitted_at=when)
