from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, SubmitTestView, TeacherResultsView, LectureViewSet, TestViewSet, MeView, GroupListView, SubmissionDetailView, QuestionViewSet, ChoiceViewSet

# Роутер автоматически создает пути для стандартных действий (список, создание, удаление)
router = DefaultRouter()
router.register(r'lectures', LectureViewSet, basename='lecture')
router.register(r'tests', TestViewSet, basename='test')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'choices', ChoiceViewSet, basename='choice')

urlpatterns = [
    # Подключаем автоматические пути роутера (api/tests/ и api/lectures/)
    path('', include(router.urls)),

    # Путь для отправки результатов теста учеником
    path('submit-test/', SubmitTestView.as_view(), name='submit-test'),

    # Путь для получения результатов тестов учителем (личный кабинет)
    path('teacher/results/', TeacherResultsView.as_view(), name='teacher-results'),
    path('results/', TeacherResultsView.as_view(), name='results'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('groups/', GroupListView.as_view(), name='group-list'),
    path('submission/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),
]