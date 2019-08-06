"""Performance URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from Main import views
from django.conf import settings
from django.views import static

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.index),
    url(r'^login/', views.login),
    url(r'^logout/', views.logout),
    url(r'^app/', include('app.urls')),
    url(r'^spec/', include('spec.urls')),
    url(r'^upload/', views.upload),
    url(r'^snapshots/', views.snapshots),
    url(r'^file_download/(.*)', views.file_download),

    #Summary
    url(r'^summary/([\w|-]+)', views.summary),
    url(r'^query_release/', views.query_release),
    url(r'^home/', views.home_page),
    url(r'^home_table/', views.home_table),

]
