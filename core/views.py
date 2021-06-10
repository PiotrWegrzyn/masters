from django.views.generic.base import TemplateView


class MainMapView(TemplateView):
    template_name = "main.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data()

        context['cities'] = self.get_cities()
        context['authors'] = self.get_authors()
        context['map_years'] = self.get_map_years()
        context['regions'] = self.get_regions()

        return context

    def get_cities(self):
        return ['Kraków', 'Brzesko', 'Działoszyce', 'Garwolin', 'Grojec', 'Minsk Mazowiecki', 'Mszczonów', 'Rabka', 'Warszawa']

    def get_authors(self):
        return ['Kasia', 'Basia', 'Asia']

    def get_map_years(self):
        return ['1939', '1940', '1941', '1942', '1943', '1944']

    def get_regions(self):
        return ['Kraków', 'Brzesko', 'Działoszyce', 'Garwolin', 'Grojec', 'Minsk Mazowiecki', 'Mszczonów', 'Rabka',
                'Warszawa Pn.', 'Warszawa Poł.']

