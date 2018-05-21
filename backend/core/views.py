from django.shortcuts import redirect


def index(request):
    return redirect('http://localhost:8080/')
