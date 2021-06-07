from django.views.generic.base import TemplateView


class MainMapView(TemplateView):
    template_name = "main.html"
