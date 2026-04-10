from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ActionLogViewSet

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')
router.register(r'logs', ActionLogViewSet, basename='actionlog')

urlpatterns = [
    path('', include(router.urls)),
]