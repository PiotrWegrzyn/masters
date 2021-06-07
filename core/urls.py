from django.conf.urls import url

from core import views

urlpatterns = [
    url('', views.MainMapView.as_view(), name="main")
]