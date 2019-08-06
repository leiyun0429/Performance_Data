import configparser, os, json
from Performance.custom_setting import ERROR_LOGS, ACCESS_LOGS, WARNING_LOGS

filter_condition_key = ''
appname_reflect = ''


def get_envir():
    try:
        cf = configparser.ConfigParser()
        pwd = os.getcwd()
        cf.read(pwd + '/conf/performance.conf')
        appname_reflect_func()
        return cf.get('filter_key_condition', 'special_filter_condition')
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def get_wsgi_envir():
    try:
        cf = configparser.ConfigParser()
        pwd = os.popen('pwd').read().replace('\n', '')
        cf.read(pwd + '/conf/performance.conf')
        appname_reflect_func()
        return cf.get('filter_key_condition', 'special_filter_condition')
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e


def appname_reflect_func():
    try:
        global appname_reflect
        pwd = os.getcwd()
        with open(pwd + '/conf/appname.json', 'r') as appname_json:
            appname_reflect = json.load(appname_json)
    except Exception as e:
        ERROR_LOGS.error(e)
        raise e
