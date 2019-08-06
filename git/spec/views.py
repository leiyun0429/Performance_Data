from django.shortcuts import render
from libary import configuration
from django.http import HttpResponse
import json
from libary.spec import testname
from libary.summary import obtain_summary
from Main.views import check_status
from libary.spec import standard_filter, delete_release
from libary.spec.comments import Comment
import collections
from collections import OrderedDict
import copy
from libary.common.draw_figure import AutoGenEcharts
from libary.common.draw_table import AutoGenTable
from Performance.custom_setting import ERROR_LOGS, ACCESS_LOGS, WARNING_LOGS
import libary.common.const


# Create your views here.


def spec(request):

    return render(request, 'spec/spec.html')


def filter(request):
    haha = request.GET.getlist('hobby')
    for i in request.GET:
        print(i)
    print(haha)
    HttpResponse('ok')


def single_menu(request):
    results = request.GET
    single_menu_list = [] #['release='v1'',os='v1']
    single_menu_str = '' #[release='v1' or release='v2']
    for result in results:
        selected_list = results.getlist(result, default=None)
        for i in range(0, len(selected_list)):
            if i == len(selected_list) - 1:
                single_menu_str = single_menu_str + result + '=' + '\'' + selected_list[i] + '\''
            else:
                single_menu_str = single_menu_str + result + '=' + '\'' + selected_list[i] + '\'' + ' or '
        single_menu_list.append(single_menu_str)
        single_menu_str = ''
    HttpResponse(single_menu_list)


def data_center(request):
    data_first = [['Platform', '400.a', '400.b', '400.c', '400.d', '400.e'], ['Legend1', 96, 67, 24, 23, 12],['Legend2', 90, 17, 48, 87, 44]]
    data_second = [['Platform', '400.a', '400.b', '400.c', '400.d', '400.e'], ['Legend3', 96, 67, 24, 23, 12],['Legend4', 90, 17, 48, 87, 44]]
    data = [data_first, data_second]
    config = [['release', 'os', 'kernel', 'network'], ['HSRP1.1', 'CENTOS7.4', '1.2.3', '40G'], ['HSRP1.2', 'CENTOS7.5', '1.2.4', '10G']]
    tune = ['Do not touch me', 'Do not touch him']
    comments = ['It does not matter', 'You are in danger']
    my_data = {
        'data_table': data,
        'config': config,
        'tune': tune,
        'comments': comments
    }

    #1
    #Obtain_query_box(app='speccpu')
    #return query_box

    # query_box = {
    #     'release': ['hsrp1.1', 'hsrp1.2', 'hsrp2.1'],
    #     'kernel': ['kernel1.1', 'kernel2.1'],
    #     'os': ['os1.1', 'os2.1'],
    #     'network': ['network1.1', 'network1.2', 'network1.3', 'network1.4']
    # }
    # #2
    # list = ['os="centos7.4" or release="centos7.5"', 'kernel="kernel1.1"']
    # name = ['os', 'kernel']
    # filter_release_bench(list, name, app='speccpu')

    # filter_release = {'release_id1': ['release(hsrp1.1+40core+AW2.1+centos7.4+kernel1.1)'],
    #                   'release_id2': ['release(hsrp1.2+os+48core+AW2.0+centos7.4+kernel1.1)'],
    #                   'release_id3': ['release(hsrp1.2+os+40core+AW2.1+centos7.4+kernel1.1)']}
    #return filter_release

    #3
    #list1 = ['release_id1', 'release_id2']
    #release_detail_info(list1, app='speccpu')

    # standard_data_form = {
    #         'SSD': {
    #             'Read-128k-8threads':   {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #             'Write-128k-8threads':   {
    #                 'Iops': [96],
    #             },
    #             'randRead-4k-8threads':   {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #             'randWrite-4k-8threads':   {
    #                 'Bandwith': [96],
    #             },
    #         },
    #
    #         'NVMe': {
    #             'Read-128k-8threads':  {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #             'Write-128k-8threads': {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #         },
    #     }
    #
    # standard_data_form1 = {
    #         'SSD': {
    #             'Read-128k-8threads':   {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #             'Write-128k-8threads':   {
    #                 'Iops': [96],
    #             },
    #             'randRead-4k-8threads':   {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #             'randWrite-4k-8threads':   {
    #                 'Bandwith': [96],
    #             },
    #         },
    #
    #         'NVMe': {
    #             'Read-128k-8threads':  {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #             'Write-128k-8threads': {
    #                 'Bandwith': [96],
    #                 'Iops': [96],
    #             },
    #         },
    #     }
    #
    # standard_data_figure = {
    #     'SSD': {
    #         'Bandwidth': {
    #             'Read-128k-8threads': [96],
    #             'Write-128k-8threads': [96],
    #             'randWrite-128k-8threads': [96],
    #         },
    #         'Iops': {
    #             'Read-128k-8threads': [96],
    #             'Write-128k-8threads': [96],
    #             'randRead-128k-8threads': [96],
    #             'randWrite-128k-8threads': [96],
    #         }
    #     },
    # }
    #
    # standard_data_figure1 = {
    #     'SSD': {
    #         'Bandwidth': {
    #             'Read-128k-8threads': [96],
    #             'randRead-128k-8threads': [96],
    #             'randWrite-128k-8threads': [96],
    #         },
    #     },
    #     'NVMEv': {
    #         'Bandwidth': {
    #             'Read-128k-8threads': [96],
    #             'Write-128k-8threads': [96],
    #             'randRead-128k-8threads': [96],
    #             'randWrite-128k-8threads': [96],
    #         },
    #     },
    # }
    #
    # my_result = {
    #     'fio-SSD-Bandwidth': {
    #         'xaixs': ['Read-128k-8threads', 'Write-128k-8threads', 'randRead-128k-8threads', 'randWrite-128k-8threads'],
    #         'data': [{
    #             'name': 'lalalalala',
    #             'data': [96, 96, 96, 96]
    #         },
    #             {
    #                 'name': 'hahaha',
    #                 'data': [96, 96, 96, 96]
    #             }]
    #     },
    #     'fio-SSD-Iops': {
    #         'xaixs': ['Read-128k-8threads', 'Write-128k-8threads', 'randRead-128k-8threads', 'randWrite-128k-8threads'],
    #         'data': [{
    #             'name': 'kakakaka',
    #             'data': [96, 96, 96, 96]
    #         },
    #             {
    #                 'name': 'yaayay',
    #                 'data': [96, 96, 96, 96]
    #             }]
    #     },
    # }
    #
    # # standard_data_form = {
    # #     'int': {
    # #         '400.a': [96],
    # #         '400.b': [96],
    # #         '400.c': [96],
    # #         '400.d': [96],
    # #         '400.e': [96],
    # #     },
    # #     'fp': {
    # #         '400.e': [96],
    # #         '400.f': [96],
    # #         '400.g': [96],
    # #         '400.h': [96],
    # #         '400.j': [96],
    # #     },
    # # }
    #
    # # standard_data_form1 = {
    # #     'int': {
    # #         '400.a': [96],
    # #         '400.b': [96],
    # #         '400.c': [96],
    # #         '400.d': [96],
    # #         '400.e': [96],
    # #     },
    # # }
    #
    # # standard_data_form = {
    # #     'uni': [96],
    # #     'bi': [96]
    # # }
    #
    # # standard_data_form = {
    # #     'l1_cache': [96],
    # #     'l2_cache': [96]
    # # }
    #
    # standard_soft_config = {
    #     'os': ['1.2.3'],
    #     'kernel': ['1.2.3.4'],
    #     'network': ['eth0,<speed>,<driver>,<vendor>,<Bus>;eth1,<speed>,<driver>,<vendor>,<Bus>'],
    # }
    #
    # standard_tune = {
    #     'tune_id': '1',
    #     'tune': ['fshkfhieshfiesfisefihaidheifheiwhfiehfehfi;fhwifhiwhfwifhuwhufeuufewfjijfiwhfihwfh']
    # }
    #
    # standard_hard_config = {
    #     'cpu': ['47'],
    #     'disk': ['sda,<size>,<type>,<interface>,<io_scheduler>,<vendor>;sdb,<size>,<type>,<interface>,<io_scheduler>,<vendor>']
    # }
    #
    # standard_title = 'release(hsrp1.1+40core+AW2.1+centos7.4+kernel1.1)'
    #
    # release = {
    #     'standard_data_form': standard_data_form,
    #     'standard_data_figure': standard_data_figure,
    #     'standard_soft_config': standard_soft_config,
    #     'standard_hard_config': standard_hard_config,
    #     'standard_tune': standard_tune,
    #     'standard_title': standard_title
    # }
    #
    # release1 = {
    #     'standard_data': standard_data_form1,
    #     'standard_data_figure': standard_data_figure1,
    #     'standard_soft_config': standard_soft_config,
    #     'standard_hard_config': standard_hard_config,
    #     'standard_tune': standard_tune,
    #     'standard_title': standard_title
    # }
    #
    # result = {'release': release,
    #             'release1':release1}

    #4
    #content = 'jaljdiehfeifgeuifujshs'
    #save_tune(tune_id, content)
    #return result={flag:True, message:'success!'}
    return HttpResponse(json.dumps(my_data), content_type="application/json")


def table_summary(request):
    #list = ['HSRP1.1', 'HSRP1.2', 'HSRP1.3']

    #Obtain_Summary(list)
    #return summary

    benchmark = {'items': [1, 2, 3]}
    speccpu_2006 = {'int': ['dirccc', 'un', 'dakj'], 'float': [4, 5, 6]}
    specjbb_2015 = {'max-jobs': [1, 2, 3], 'critical-jobs': [4, 5, 6]}
    lmbench = {'latency': [1, 2, 3]}
    fio = {
        'SSD': {
            # 'sequency-read': [1, 2, 3],
            # 'sequency-write': [1, 2, 3],
            # 'random-read': [1, 2, 3],
            # 'random-write': [1, 2, 3],
            'sequency-read': {'haha': [1, 2, 3], 'hehe': [1, 2, 3]},
            'sequency-write': {'haha': [1, 2, 3], 'hehe': [1, 2, 3]},
            'random-read': {'haha': [1, 2, 3], 'hehe': [1, 2, 3]},
            'random-write': {'haha': [1, 2, 3], 'hehe': [1, 2, 3]},
        },
        'NVMe': {
            'sequency-read': [1, 2, 3],
            'sequency-write': [1, 2, 3],
            'random-read': [1, 2, 3],
            'random-write': [1, 2, 3]
        }
    }
    summary_data = {
        'benchmark': benchmark,
        'speccpu_2006': speccpu_2006,
        'specjbb_2015': specjbb_2015,
        'lmbench': lmbench,
        'fio': fio
    }

    summary_soft_config = {
        'os': '1.2.3',
        'kernel': '1.2.3.4'
    }

    summary_hard_config = {
        'cpu': '47',
        'network': '1.2.3.4dahhdeishfkeshfihaoiheiawwheaihawihiwua'
    }
    summary_title = ['HSRP1.1+48c+cpu+pf', '', '']
    summary = {
        'summary_data': summary_data,
        'summary_soft_config': summary_soft_config,
        'summary_hard_config': summary_hard_config,
        'summary_title': summary_title
    }

    return HttpResponse(json.dumps(summary), content_type="application/json")


@check_status
def standard(request):
    try:
        parameters = request.GET
        full_path = request.get_full_path()
        username = request.COOKIES.get('username', '')
        ACCESS_LOGS.info('User=' + username + ' parameter=' + str(parameters) + ' full_path=' + full_path)
        result = testname.get_testcases_relation('standard')
        ACCESS_LOGS.info(str(result))
        if 'SpecCPU' in result['standard']:
            result['standard']['SpecCPU'] = []
        standard_result = result['standard']
        sql = "select version from release_version"
        conn = obtain_summary.connect_database()
        cursor = conn.cursor()
        count = cursor.execute(sql)
        releases = []
        if count != 0:
            for result in cursor.fetchall():
                releases.append(result[0].upper())
        ACCESS_LOGS.info('release=' + str(releases))
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e

    try:
        release_newest = obtain_summary.obtain_latest_release()
        ACCESS_LOGS.info('release_newest=' + str(release_newest))
        response = render(request, 'spec/standard.html', {'standard_app': standard_result, 'releases': releases,
                                                      'username': username, 'release_newest': release_newest})
        query_dict = {}
        for param in parameters:
            if param != 'app' or param != 'query_item':
                param_list = parameters.getlist(param, default=None)
                query_dict[param] = param_list
        response.set_cookie('filter_condition', query_dict, 300)

        if '?' in full_path:
            path = full_path.split('?')
            app = request.GET.get('app')
            response.set_cookie('copy_path', path[1], 300)
            response.set_cookie('app', app, 3000)
            ACCESS_LOGS.info('parameters=' + str(parameters) + 'query_dict=' + str(query_dict) + 'path=' + str(path) + 'app=' + app)
        return response
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def spec_filter(request):
    try:
        app = request.GET.get('name')
        default_boxs = standard_filter.obtain_default_boxes(app)
        ACCESS_LOGS.info('app=' + app + 'default_boxs=' + str(default_boxs))
        temp = []
        release_attrs = []
        for default_item in default_boxs:
            if default_item in ['version', 'cpu_type', 'board_type']:
                for release_attr in default_boxs[default_item]:
                    if release_attr == 'hsrp':
                        temp += default_boxs[default_item][release_attr]
                    else:
                        if release_attr not in release_attrs:
                            release_attrs.append(release_attr)
                        temp.append(release_attr)
                        temp += default_boxs[default_item][release_attr]
                default_boxs[default_item] = copy.deepcopy(temp)
                temp = []
        boxs = {'defaultts': default_boxs,
                'extra': standard_filter.obtain_extra_keywords(app),
                'release_attr': release_attrs}
        ACCESS_LOGS.info('boxs=' + str(boxs))
        response = HttpResponse(json.dumps(boxs), content_type="application/json")
        response.set_cookie('app', app, 3000)
        return response
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def standard_latest(request):
    try:
        app = request.COOKIES.get('app', '')
        data_no_deep = standard_filter.obtain_latest_data(app)
        ACCESS_LOGS.info('app=' + app + 'data_no_deep=' + str(data_no_deep))
        if data_no_deep == OrderedDict():
            return
        data = copy.deepcopy(data_no_deep)

        standard_title = 'standard_title'
        standard_data_figure = 'standard_data_figure'
        standard_data_form = 'standard_data_form'
        standard_soft_config = 'standard_soft_config'
        standard_hard_config = 'standard_hard_config'
        standard_tune = 'standard_tune'
        standard_tune_customization = 'standard_tune_customization'

        keys = list(data.keys())
        result = AutoGenTable(data_no_deep, keys).combine_release_data(standard_data_form)
        ACCESS_LOGS.info('result=' + str(result))
        tmp_result = collections.OrderedDict()
        if app in ['lmbench-stream', 'lmbench-latency']:
            if app == 'lmbench-stream':
                for key in list(result.keys()):
                    tmp_result[key + '(MB/s)'] = copy.deepcopy(result[key])
            if app == 'lmbench-latency':
                for key in list(result.keys()):
                    tmp_result[key + '(ns)'] = copy.deepcopy(result[key])
            result = copy.deepcopy(tmp_result)
        result = {app: result}
        ACCESS_LOGS.info('result=' + str(result))

        soft_config = AutoGenTable(data_no_deep, keys).combine_release_soft_config(standard_soft_config)
        hard_config = AutoGenTable(data_no_deep, keys).combine_release_hard_config(standard_hard_config)
        tune = AutoGenTable(data_no_deep, keys).combine_release_tune(standard_tune)
        ACCESS_LOGS.info('soft_config=' + str(soft_config))
        ACCESS_LOGS.info('hard_config=' + str(hard_config))
        ACCESS_LOGS.info('tune=' + str(tune))

        figure_data = collections.OrderedDict()
        titles = []
        customization = []
        dataset_ids = []
        release_id = []
        app_dict = {'lmbench-stream': 'lmbench-stream(MB/s)', 'lmbench-latency': 'lmbench-latency(ns)', 'specjbb': 'specjbb'}
        for key in keys:
            release_id.append(key)
            dataset_ids.append(key)
            titles.append(data[key][standard_title])
            customization.append(data[key][standard_tune_customization]['Customization'][0])
            figure_data[key] = collections.OrderedDict()
            if app in app_dict:
                figure_data[key][standard_data_figure] = collections.OrderedDict()
                figure_data[key][standard_data_figure][app_dict[app]] = data[key][standard_data_figure]
            else:
                figure_data[key][standard_data_figure] = data[key][standard_data_figure]
            figure_data[key][standard_title] = data[key][standard_title]

        figure = AutoGenEcharts(figure_data, standard_title, standard_data_figure).combine_figure_data()
        ACCESS_LOGS.info('figure=' + str(figure))

        comments = Comment.get_comment(release_id)

        last = {
            'standard_data_form': result,
            'standard_data_figure': figure,
            'standard_soft_config': soft_config,
            'standard_hard_config': hard_config,
            'standard_tune': tune,
            'standard_title': titles,
            'standard_tune_customization': customization,
            'standard_ids': dataset_ids,
            'standard_comments': comments
        }
        ACCESS_LOGS.info('last=' + str(last))
        return HttpResponse(json.dumps(last), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def add_filters(request):
    try:
        condition = request.GET.get('condition')
        app = request.COOKIES.get('app', '')
        filters = standard_filter.obtain_extra_box(app, condition)
        ACCESS_LOGS.info('app=' + app + 'condition' + str(condition) + 'filters=' + str(filters))
        return HttpResponse(json.dumps(filters), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def filter_query_table(request):
    try:
        app = request.COOKIES.get('app', '')
        query_str = request.GET.get('query')
        query_list = query_str.split('&')
        ACCESS_LOGS.info('app=' + app + 'query_str' + str(query_str) + 'query_list=' + str(query_list))
        query_dict = {}
        for query in query_list:
            lists = query.split('=')
            if lists[0] not in query_dict:
                query_dict[lists[0]] = [lists[1].replace('+', ' ')]
            else:
                query_dict[lists[0]].append(lists[1].replace('+', ' '))

        if 'last_update' in query_dict:
            query_dict['last_update'] = query_dict['last_update'][0]

        results = standard_filter.obtain_query_results(query_dict, app)
        ACCESS_LOGS.info('results=' + str(results))
        return_results = OrderedDict()
        for result in results:
            length = len(results[result])
            results[result][length-1] = str(results[result][length-1])
            return_results['filter_table_' + str(result)] = results[result]
        ACCESS_LOGS.info('return_results=' + str(return_results))
        response = HttpResponse(json.dumps(return_results), content_type="application/json")
        response.set_cookie('filter_condition', query_dict, 300)
        return response
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def standard_query(request):
    try:
        global no_order
        release_ids = request.GET.getlist('query_item')
        app = request.COOKIES.get('app', '')
        filter_condition = eval(request.COOKIES.get('filter_condition', ''))
        ACCESS_LOGS.info('app=' + app + 'release_ids' + str(release_ids) + 'filter_condition=' + str(filter_condition))
        special_filter_condition = {}

        for key in list(eval(configuration.filter_condition_key)):
            if key in filter_condition:
                special_filter_condition[key] = filter_condition[key]
        if len(special_filter_condition) == 0:
            special_filter_condition = None

        data_no_deep = standard_filter.obtain_detail_data(release_ids, app, conditions_dict=special_filter_condition)
        data = copy.deepcopy(data_no_deep)
        ACCESS_LOGS.info('data=' + str(data))

        standard_title = 'standard_title'
        standard_data_figure = 'standard_data_figure'
        standard_data_form = 'standard_data_form'
        standard_soft_config = 'standard_soft_config'
        standard_hard_config = 'standard_hard_config'
        standard_tune = 'standard_tune'
        standard_tune_customization = 'standard_tune_customization'

        keys = list(data.keys())
        result = AutoGenTable(data_no_deep, keys).combine_release_data(standard_data_form)
        ACCESS_LOGS.info('result=' + str(result))
        tmp_result = collections.OrderedDict()
        if app in ['lmbench-stream', 'lmbench-latency']:
            if app == 'lmbench-stream':
                for key in list(result.keys()):
                    tmp_result[key + '(MB/s)'] = copy.deepcopy(result[key])
            if app == 'lmbench-latency':
                for key in list(result.keys()):
                    tmp_result[key + '(ns)'] = copy.deepcopy(result[key])
            result = copy.deepcopy(tmp_result)
        result = {app: result}
        ACCESS_LOGS.info('result=' + str(result))
        soft_config = AutoGenTable(data_no_deep, keys).combine_release_soft_config(standard_soft_config)
        hard_config = AutoGenTable(data_no_deep, keys).combine_release_hard_config(standard_hard_config)
        tune = AutoGenTable(data_no_deep, keys).combine_release_tune(standard_tune)
        ACCESS_LOGS.info('soft_config=' + str(soft_config))
        ACCESS_LOGS.info('hard_config=' + str(hard_config))
        ACCESS_LOGS.info('tune=' + str(tune))

        figure_data = collections.OrderedDict()
        titles = []
        customization = []
        dataset_ids = []
        app_dict = {'lmbench-stream': 'lmbench-stream(MB/s)', 'lmbench-latency': 'lmbench-latency(ns)',
                    'specjbb': 'specjbb'}
        for key in keys:
            dataset_ids.append(key)
            titles.append(data[key][standard_title])
            customization.append(data[key][standard_tune_customization]['Customization'][0])
            figure_data[key] = collections.OrderedDict()
            if app == 'specjbb' or app == 'lmbench-stream' or app == 'lmbench-latency':
                figure_data[key][standard_data_figure] = collections.OrderedDict()
                figure_data[key][standard_data_figure][app_dict[app]] = data[key][standard_data_figure]
            else:
                figure_data[key][standard_data_figure] = data[key][standard_data_figure]
            figure_data[key][standard_title] = data[key][standard_title]
        figure = AutoGenEcharts(figure_data, standard_title, standard_data_figure).combine_figure_data()
        ACCESS_LOGS.info('figure=' + str(figure))
        comments = Comment.get_comment(release_ids)
        print(comments)
        last = {
            'standard_data_form': result,
            'standard_data_figure': figure,
            'standard_soft_config': soft_config,
            'standard_hard_config': hard_config,
            'standard_tune': tune,
            'standard_title': titles,
            'standard_tune_customization': customization,
            'standard_ids': dataset_ids,
            'standard_comments': comments
        }
        ACCESS_LOGS.info('last=' + str(last))
        return HttpResponse(json.dumps(last), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def update_tune(request):
    try:
        ids = request.GET
        update_ids = {}
        result = {'flag': 'Update End!'}
        for id in ids:
            update_ids[id] = ids[id]
        standard_filter.update_tune_customization(update_ids)
        result = {'flag': 'Update End!'}
        ACCESS_LOGS.info('update_ids=' + str(update_ids))
        return HttpResponse(json.dumps(result), content_type="application/json")
    except Exception as err:
        result = {'flag': str(err)}
        ERROR_LOGS.error(err)
        return HttpResponse(json.dumps(result), content_type="application/json")


@check_status
def spec_delete(request):
    try:
        release_ids_format = request.GET.get('delete_list')
        release_ids = release_ids_format.split('&')
        user = request.COOKIES.get('user_number', '')
        ACCESS_LOGS.info('user=' + user + 'release_ids' + str(release_ids) + 'release_ids_format=' + str(release_ids_format))
        release_ids.pop()
        if user == '1680505' or user == '1680342':
            result = delete_release.delete_by_release(release_ids)
        else:
            result = {'flag': "Failed: Permission denied"}
        return HttpResponse(json.dumps(result), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def insert_spec_comments(request):
    try:
        comment = {
            'username': request.COOKIES.get('username', ''),
            'testcase_exec_id': request.GET.get('comment_id'),
            'content': request.GET.get('content')
        }
        result = Comment.insert_comment(comment)
        ACCESS_LOGS.info(result)
        id_string = request.GET.get('standard_ids')
        standard_ids = id_string.split(',')
        print(standard_ids)
        print(Comment.get_comment(standard_ids))
        return HttpResponse(json.dumps(Comment.get_comment(standard_ids)), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


@check_status
def modify_spec_comments(request):
    try:
        comment = {
            'comment_id': request.GET.get('comment_id'),
            'content': request.GET.get('content')
        }
        result = Comment.update_comment(comment)
        return HttpResponse(json.dumps(result), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def delete_spec_comments(request):
    try:
        result = Comment.delete_comment(request.GET.get('comment_id'))
        return HttpResponse(json.dumps(result), content_type="application/json")
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e

