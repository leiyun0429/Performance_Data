from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^spec/', views.spec),
    url(r'^filter/', views.filter),
    url(r'^data_center/', views.data_center),
    url(r'^single_menu/', views.single_menu),
    url(r'^table_summary/', views.table_summary),
    url(r'^standard/', views.standard),
    url(r'^spec_filter/', views.spec_filter),
    url(r'^add_filters/', views.add_filters),
    url(r'^updateTune/', views.update_tune),
    url(r'^spec_delete/', views.spec_delete),
    url(r'^insert_spec_comment/', views.insert_spec_comments),
    url(r'^modify_spec_comment/', views.modify_spec_comments),
    url(r'^delete_spec_comment/', views.delete_spec_comments),

    #url(r'^query_result_list/', views.query_result_list),
    url(r'^filter_query_table/', views.filter_query_table),
    url(r'^standard_query/', views.standard_query),
    url(r'^standard_latest/', views.standard_latest),
]