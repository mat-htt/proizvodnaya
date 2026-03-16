from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestViewSet, SubmitTestView, LectureViewSet, TeacherResultsView

# Роутер автоматически создает пути для стандартных действий (список, создание, удаление)
router = DefaultRouter()
router.register(r'tests', TestViewSet)
router.register(r'lectures', LectureViewSet, basename='lecture')
urlpatterns = [
    # Подключаем автоматические пути роутера (api/tests/ и api/lectures/)
    path('', include(router.urls)),

    # Путь для отправки результатов теста учеником
    path('submit-test/', SubmitTestView.as_view(), name='submit-test'),

    # Путь для получения результатов тестов учителем (личный кабинет)
    path('teacher/results/', TeacherResultsView.as_view(), name='teacher-results'),
]