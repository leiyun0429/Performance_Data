from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, HttpResponse
import json, os, re, base64
from libary.ldap.ldap_auth import LdapAuth
from libary.summary import obtain_summary, home_server
from Performance.custom_setting import ERROR_LOGS, ACCESS_LOGS, WARNING_LOGS
from libary.spec import import_standard_data, testname, report
import collections
from libary.common.draw_table import AutoGenTable
from libary import configuration
# Create your views here.


def check_status(func):
    def inner(request):
        if request.COOKIES.get('username', ''):
            r = func(request)
            return r
        else:
            return redirect('/')
    return inner


def check_summary_status(func):
    def inner(request, name):
        if request.COOKIES.get('username', ''):
            r = func(request, name)
            return r
        else:
            return redirect('/')
    return inner


my_count = 1


def index(request):
    return render(request, 'login.html')


def login(request):
    try:
        username = request.POST.get('username')
        password = request.POST.get('password')
        username, user_number = LdapAuth(username, password).auth()
        if username:
            request.session['username'] = username
            response = HttpResponseRedirect('/home')
            response.set_cookie('username', username, 3000)
            response.set_cookie('user_number', user_number, 3000)
            return response
        else:
            return render(request, 'login.html', {'message': 'Wrong username or password'})
    except Exception as e:
        ERROR_LOGS.error(e)
        return render(request, 'login.html', {'message': 'Wrong username or password'})


def logout(request):
    try:
        response = HttpResponseRedirect('/')
        response.delete_cookie('username')
        response.delete_cookie('user_number')
        return response
    except Exception as e:
        ERROR_LOGS.error(str(e))
        raise e


@check_status
def upload(request):
    try:
        files = request.FILES.getlist('filename')
        release = request.POST.get('release')
        name = request.COOKIES.get('user_number', '')
        tune = request.POST.get('tune')
        ACCESS_LOGS.info(' name=' + name + ' release' + str(release) + ' tune=' + str(tune))
        filenames = {
            'csv': '',
            'ini': '',
            '7z': ''
        }
        count = 0
        for file in files:
            if '.csv' in file.name:
                filenames['csv'] = 'static/file/upload/' + file.name
            elif '.ini' in file.name:
                filenames['ini'] = 'static/file/upload/' + file.name
            else:
                filenames['7z'] = 'static/file/upload/' + file.name
            count = count + 1
            try:
                new_file = open(os.path.join('static/file/upload/', file.name), 'wb')
                for chunk in file.chunks():
                    new_file.write(chunk)
                new_file.close()
            except Exception as e:
                ERROR_LOGS.error('Upload Exception:' + e)
                raise e
        result1 = import_standard_data.import_data(filenames['csv'], filenames['ini'], filenames['7z'], tune, name, release)
        result1['message'] = 'Info: ' + str(result1['message'])
        return HttpResponse(json.dumps(result1), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def snapshots(request):
    try:
        snapshots = request.POST.get('snapshots').split(',')
        filetype = request.POST.get('filetype')
        source = request.POST.get('source')
        app = request.COOKIES.get('app', '')
        ACCESS_LOGS.info(' app=' + app + ' snapshots' + str(snapshots) + ' filetype=' + str(filetype))
        export = {}
        for snapshot in snapshots:
            item = request.POST.get(snapshot)
            if snapshot == 'system-setting':
                snapshot = 'tune'
            if item != 'data:,':
                image = item.replace('data:image/jpeg;base64,', '')
                try:
                    new_file = open(os.path.join('static/file/snapshots/', snapshot + '.jpeg'), 'wb')
                    new_file.write(base64.b64decode(image))
                    new_file.close()
                except Exception as e:
                    ERROR_LOGS.error('Write file failed:' + e)

                way = 'static/file/snapshots/' + snapshot + '.jpeg'
                if snapshot in export:
                    export[snapshot].append(way)
                else:
                    try:
                        export[snapshot] = [way]
                    except Exception as e:
                        ERROR_LOGS.error(e)
            else:
                export[snapshot] = []

        if source == 'standard':
            export['testname'] = configuration.appname_reflect[app]
            export['version'] = 'hsrp'
            link = report.export_report(export, source)
        if source == 'summary':
            export['version'] = 'hsrp'
            hsrp = request.POST.get('hsrp')
            export['version'] = hsrp.replace('_', ' ')
            link = report.export_report(export, source)
        # image = "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"
        # fh = open(os.path.join('static/file/snapshots/', 'chart.jpeg'), "wb")
        # fh.write(base64.b64decode(image))
        # fh.close()
        paths = link[filetype].split('/')
        filename = paths[len(paths)-1]
        result = {
            'link': filename
        }
        ACCESS_LOGS.info(' filename=' + filename + ' paths' + str(paths) + ' result=' + str(result))
        return HttpResponse(json.dumps(result), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def file_download(request, filename):
    try:
        file = open('static/file/download/' + filename, 'rb')
        response = HttpResponse(file)
        response['Content-Disposition'] = 'attachment;filename=' + filename
        return response
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_summary_status
def summary(request, name):
    try:
        username = request.COOKIES.get('username', '')
        response = render(request, 'summary.html', {'releases': obtain_summary.obtain_all_releases(), 'username': username, 'release_name': name,
                                                    'release_newest': obtain_summary.obtain_latest_release()})
        return response
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def query_release(request):
    try:
        releases = request.GET.getlist('release')
        ACCESS_LOGS.info(' result=' + str(releases))
        if len(releases):
        # summary_data = {
        #     'benchmark': {'items': [2]},
        #     'speccpu_2006': {'int': [1], 'float': [4]},
        #     'specjbb_2015': {'max-jobs': [3], 'critical-jobs': [5]},
        #     'lmbench': {'latency': [3]},
        # }
        # summary_soft_config = {
        #     'os': ['1.2.3'],
        #     'kernel': ['1.2.3.4'],
        #     'network': ['eth0,<speed>,<driver>,<vendor>,<Bus>;eth1,<speed>,<driver>,<vendor>,<Bus>'],
        # }
        # summary_hard_config = {
        #     'cpu': ['47'],
        #     'disk': ['sda,<size>,<type>,<interface>,<io_scheduler>,<vendor>;sdb,<size>,<type>,<interface>,<io_scheduler>,<vendor>']
        # }
        #
        # hsrp1 = {
        #     'summary_data': summary_data,
        #     'summary_soft_config': summary_soft_config,
        #     'summary_hard_config': summary_hard_config,
        #     'summary_title': 'HSRP1.1'
        # }
        #
        # summary_data1 = {
        #     # 'benchmark': {'items': [2]},
        #     'speccpu_2006': {'int': [1], 'float': [4]},
        #     'specjbb_2015': {'max-jobs': [3], 'critical-jobs': [5]},
        #     'lmbench': {'latency': [3]},
        #     'fio': {
        #         'SSD': {
        #             'sequency-read': [1],
        #             'sequency-write': [2],
        #             'random-read': [3],
        #             'random-write': [4],
        #         },
        #         'NVMe': {
        #             'sequency-read': [5],
        #             'sequency-write': [6],
        #             'random-read': [7],
        #             'random-write': [8],
        #         }
        #     }
        # }
        #
        # summary_soft_config1 = {
        #     'os': ['1.2.3'],
        #     'network': ['eth0,<speed>,<driver>,<vendor>,<Bus>'],
        #     'kernel': ['1.2.3.4']
        # }
        #
        # summary_hard_config1 = {
        #     'cpu': ['47'],
        #     'disk': ['sda,<size>,<type>,<interface>,<io_scheduler>,<vendor>']
        # }
        #
        # hsrp2 = {
        #     'summary_data': summary_data1,
        #     'summary_soft_config': summary_soft_config1,
        #     'summary_hard_config': summary_hard_config1,
        #     'summary_title': 'HSRP1.2'
        # }
        #
        # summary_data2 = {
        #     # 'benchmark': {'items': [2]},
        #     'specjbb_2015': {'max-jobs': [3], 'critical-jobs': [5]},
        #     'lmbench': {'latency': [3]},
        #     'fio': {
        #         'SSD': {
        #             'sequency-read': [1],
        #             'sequency-write': [2],
        #             'random-read': [3],
        #             'random-write': [4],
        #         },
        #         'NVMe': {
        #             'sequency-read': [5],
        #             'sequency-write': [6],
        #             'random-read': [7],
        #             'random-write': [8],
        #         }
        #     }
        # }
        #
        # summary_soft_config2 = {
        #     'os': ['1.2.3'],
        #     'network': ['eth0,<speed>,<driver>,<vendor>,<Bus>;eth1,<speed>,<driver>,<vendor>,<Bus>'],
        #     'kernel': ['1.2.3.4']
        # }
        #
        # summary_hard_config2 = {
        #     'cpu': ['47'],
        #     'disk': ['sda,<size>,<type>,<interface>,<io_scheduler>,<vendor>']
        # }
        #
        # hsrp3 = {
        #     'summary_data': summary_data2,
        #     'summary_soft_config': summary_soft_config2,
        #     'summary_hard_config': summary_hard_config2,
        #     'summary_title': 'HSRP1.3'
        # }
        #
        # summary = {
        #     'hsrp1': hsrp1,
        #     'hsrp2': hsrp2,
        #     'hsrp3': hsrp3
        # }
            summary = obtain_summary.obtain_summary(releases)
            summary_data = 'summary_data'
            summary_soft_config = 'summary_soft_config'
            summary_hard_config = 'summary_hard_config'
            summary_tune = 'summary_tune'
            keys = list(summary.keys())
            if len(keys):
                result = AutoGenTable(summary, keys).combine_release_data(summary_data)
                soft_config = AutoGenTable(summary, keys).combine_release_soft_config(summary_soft_config)
                hard_config = AutoGenTable(summary, keys).combine_release_hard_config(summary_hard_config)
                tune = AutoGenTable(summary, keys).combine_release_tune(summary_tune)

                last = {
                    'summary_data': result,
                    'summary_soft_config': soft_config,
                    'summary_hard_config': hard_config,
                    'summary_tune': tune,
                    'summary_title': keys
                }
            else:
                last = {'flag': False}
            ACCESS_LOGS.info(' last=' + str(last))
            return HttpResponse(json.dumps(last), content_type="application/json")
        result = {'flag': False}
        ACCESS_LOGS.info(' result=' + str(result))
        return HttpResponse(json.dumps(result), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def home_page(request):
    try:
        username = request.COOKIES.get('username', '')
        return render(request, 'home.html', {'username': username, 'release_newest': obtain_summary.obtain_latest_release()})
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def home_table(request):
    try:
        home_list = home_server.get_home_info()
        #home_list = sorted(home_list.items(), key=lambda x:x[0], reverse=True)
        result = []
        for list in home_list:
            result.append(home_list[list])
            #result.append(list[1])
        return HttpResponse(json.dumps(result), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e

