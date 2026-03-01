from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestViewSet, SubmitTestView, LectureViewSet

router = DefaultRouter()
router.register(r'tests', TestViewSet)
router.register(r'lectures', LectureViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('submit-test/', SubmitTestView.as_view(), name='submit-test'),
]