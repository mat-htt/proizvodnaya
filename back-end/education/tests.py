from io import StringIO

from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .answers import answers_match
from .models import Test


class AnswersMatchTests(TestCase):
    def test_fraction_and_decimal_are_equal(self):
        self.assertTrue(answers_match('-1/25', '-1/25'))
        self.assertTrue(answers_match('-0.04', '-1/25'))
        self.assertTrue(answers_match('−0,04', '-1/25'))
        self.assertTrue(answers_match(' -2/50 ', '-1/25'))

    def test_integer_forms(self):
        self.assertTrue(answers_match('15', '15'))
        self.assertTrue(answers_match('15.0', '15'))
        self.assertTrue(answers_match('x = 5', '5'))
        self.assertFalse(answers_match('16', '15'))

    def test_empty_and_text(self):
        self.assertFalse(answers_match('', '15'))
        self.assertFalse(answers_match(None, '15'))
        self.assertTrue(answers_match('Возрастает', 'возрастает'))


class ControlTestFlowTests(TestCase):
    def setUp(self):
        call_command('seed_control_tests', stdout=StringIO())
        self.test = Test.objects.get(series__startswith='Итоговое', variant=1)
        self.student = User.objects.create_user('student', password='pass12345')
        self.teacher = User.objects.create_user('teacher', password='pass12345', is_staff=True)
        self.client = APIClient()

    def test_student_does_not_see_answers(self):
        self.client.force_authenticate(self.student)
        data = self.client.get(f'/api/tests/{self.test.id}/').json()
        self.assertEqual(len(data['questions']), 10)
        self.assertNotIn('correct_text_answer', data['questions'][0])

    def test_teacher_sees_answers(self):
        self.client.force_authenticate(self.teacher)
        data = self.client.get(f'/api/tests/{self.test.id}/').json()
        self.assertEqual(data['questions'][0]['correct_text_answer'], '15')

    def test_submit_scores_and_returns_details(self):
        self.client.force_authenticate(self.student)
        questions = list(self.test.questions.order_by('id'))
        answers = [
            {'question_id': questions[0].id, 'text_answer': '15'},
            {'question_id': questions[6].id, 'text_answer': '-0.04'},
            {'question_id': questions[9].id, 'text_answer': '24'},
        ]
        res = self.client.post('/api/submit-test/', {'test_id': self.test.id, 'answers': answers}, format='json').json()
        self.assertEqual(res['correct_count'], 2)
        self.assertEqual(res['score'], 20)
        self.assertEqual(len(res['details']), 10)
        self.assertEqual(res['details'][9]['correct_answer'], '25')

        mine = self.client.get('/api/my-results/').json()
        self.assertEqual(len(mine), 1)
        self.assertEqual(mine[0]['score'], 20)


class StatsAndLeaderboardTests(TestCase):
    def setUp(self):
        call_command('seed_control_tests', stdout=StringIO())
        self.test = Test.objects.get(series__startswith='Итоговое', variant=1)
        self.teacher = User.objects.create_user('teacher', password='pass12345', is_staff=True)
        self.client = APIClient()
        questions = list(self.test.questions.order_by('id'))
        for name, first_answer in [('anna', '15'), ('boris', '14'), ('vera', '14')]:
            student = User.objects.create_user(name, password='pass12345')
            self.client.force_authenticate(student)
            self.client.post('/api/submit-test/', {
                'test_id': self.test.id,
                'answers': [{'question_id': questions[0].id, 'text_answer': first_answer}],
            }, format='json')

    def test_stats_counts_correct_and_common_mistakes(self):
        self.client.force_authenticate(self.teacher)
        data = self.client.get(f'/api/tests/{self.test.id}/stats/').json()
        first = data['questions'][0]
        self.assertEqual(data['attempts'], 3)
        self.assertEqual(first['correct'], 1)
        self.assertEqual(first['rate'], 33)
        self.assertEqual(first['common_wrong'][0], {'answer': '14', 'count': 2})
        self.assertEqual(data['questions'][1]['skipped'], 3)

    def test_leaderboard_orders_by_score(self):
        self.client.force_authenticate(self.teacher)
        data = self.client.get(f'/api/leaderboard/?tests={self.test.id}').json()
        self.assertEqual(data['participants'], 3)
        self.assertEqual(data['rows'][0]['name'], 'anna')
        self.assertEqual(data['rows'][0]['score'], 10)

    def test_student_cannot_see_stats(self):
        self.client.force_authenticate(User.objects.get(username='anna'))
        self.assertEqual(self.client.get(f'/api/tests/{self.test.id}/stats/').status_code, 403)


class PermissionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_anonymous_can_read_but_not_change_lectures(self):
        self.assertEqual(self.client.get('/api/lectures/').status_code, 200)
        self.assertEqual(self.client.post('/api/lectures/', {'title': 'x', 'slug': 'x'}).status_code, 401)

    def test_student_cannot_create_lecture(self):
        self.client.force_authenticate(User.objects.create_user('s', password='pass12345'))
        self.assertEqual(self.client.post('/api/lectures/', {'title': 'x', 'slug': 'x'}).status_code, 403)

    def test_submit_unknown_test_returns_404(self):
        self.client.force_authenticate(User.objects.create_user('s', password='pass12345'))
        res = self.client.post('/api/submit-test/', {'test_id': 9999, 'answers': []}, format='json')
        self.assertEqual(res.status_code, 404)


class DemoDataTests(TestCase):
    def test_seed_demo_data_creates_accounts_and_attempts(self):
        call_command('seed_demo_data', stdout=StringIO())
        teacher = User.objects.get(username='teacher.ivanova')
        self.assertTrue(teacher.is_staff)
        self.assertTrue(teacher.check_password('Teacher2026!'))
        student = User.objects.get(username='anna.smirnova')
        self.assertTrue(student.check_password('Student2026!'))
        self.assertGreater(student.student_profile.submissions.count(), 0)
        # Повторный запуск не плодит дубли
        call_command('seed_demo_data', stdout=StringIO())
        self.assertEqual(User.objects.filter(username='anna.smirnova').count(), 1)
