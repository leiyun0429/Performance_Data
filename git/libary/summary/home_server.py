# ==================================================================================
# Author: Guo Yao <yao.guo@hxt-semitech.com>
# Initial creation: 2018.09.11
# Description:
# Copyright (c) 2018 Huaxintong Semiconductor Technology Co.,Ltd.
# All Rights Reserved.
# Confidential and Proprietary - Huaxintong Semiconductor Technology Co.,Ltd.
# ==================================================================================

import pymysql
import logging
import datetime
import collections
from Performance import settings


def logging_conf(level=None):
    if not level:
        level = logging.INFO

    logger = logging.getLogger()
    logger.setLevel(level=level)
    handler = logging.FileHandler("importData.log")
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)

    console = logging.StreamHandler()
    console.setLevel(level)
    console.setFormatter(formatter)

    logger.addHandler(handler)
    logger.addHandler(console)

    return logger


def connect_database():
    return pymysql.connect(host=settings.PF_DATABASES['HOST'], port=settings.PF_DATABASES['PORT'], user=settings.PF_DATABASES['USER'], passwd=settings.PF_DATABASES['PASSWORD'], db=settings.PF_DATABASES['NAME'], charset=settings.PF_DATABASES['CHARSET'])


def get_platform_soc(cursor, release_hw_dict, version):
    sql = "select name, full from v_release_soc where version = '%s' order by name desc" % (version.lower())
    count = cursor.execute(sql)
    if count != 0:
        soc = ""
        is_first_element = True
        for soc_name, full in cursor.fetchall():
            if is_first_element:
                is_first_element = False
                if full == 'true':
                    soc = r"<b>" + soc_name + "</b>"
                else:
                    soc = soc_name
            else:
                if full == 'true':
                    soc = soc + " " + r"<b>" + soc_name + "</b>"
                else:
                    soc = soc + " " + soc_name
        release_hw_dict[version].append(soc)

    sql = "select name, full from v_release_platform where version = '%s' order by name desc" % (version.lower())
    count = cursor.execute(sql)
    if count != 0:
        platform = ""
        is_first_element = True
        for platform_name, full in cursor.fetchall():
            if is_first_element:
                is_first_element = False
                if full == 'true':
                    platform = r"<b>" + platform_name + r"</b>"
                else:
                    platform = platform_name
            else:
                if full == 'true':
                    platform = platform + " " + r"<b>" + platform_name + r"</b>"
                else:
                    platform = platform + " " + platform_name
        release_hw_dict[version].append(platform)


def get_release(release_hw_dict, sql, cursor):
    try:
        count = cursor.execute(sql)
        logging.debug("Count: %s" % (count))
        if count != 0:
            results = cursor.fetchall()
            for version, release_time, standard_link, app_link in results:
                version = version.upper()
                logging.debug("Release Version: %s, Release Time: %s" % (version, release_time))
                if version not in release_hw_dict.keys():
                    release_hw_dict[version] = []
                release_hw_dict[version].append(version)
                get_platform_soc(cursor, release_hw_dict, version)
                if len(release_hw_dict[version]) == 1:
                    logging.warning("The %s has no associated testing data" % (version))
                    release_hw_dict.pop(version)
                else:
                    if release_time is None:
                        release_hw_dict[version].append('')
                    else:
                        release_hw_dict[version].append(release_time.strftime("%Y-%m-%d"))
                    release_hw_dict[version].append("/summary/" + version.replace('.', '_'))
                    if standard_link is None:
                        release_hw_dict[version].append('')
                    else:
                        release_hw_dict[version].append(standard_link)
                    release_hw_dict[version].append("")
                    if app_link is None:
                        release_hw_dict[version].append('')
                    else:
                        release_hw_dict[version].append(app_link)
        else:
            raise Exception("The release version table has no data")
    except Exception as err:
        raise err


def get_home_info():
    release_hw_dict = collections.OrderedDict()
    conn = connect_database()
    cursor = conn.cursor()
    try:
        sql = "select distinct version, release_time, standard_link, app_link from release_version where version like 'hsrp%' order by version desc"
        get_release(release_hw_dict, sql, cursor)
        sql = "select distinct version, release_time, standard_link, app_link from release_version where version not like 'hsrp%' order by version desc"
        get_release(release_hw_dict, sql, cursor)
    except Exception as err:
        raise err
    finally:
        cursor.close()
        conn.close()
        return release_hw_dict


if __name__ == "__main__":
    logger = logging_conf(level=logging.DEBUG)
    # try:
    #     release_hw_dict = get_release()
    #     logging.debug("Release hardware: %s" %(release_hw_dict))
    #     # logging.debug("Release hardware: %s" %(release_hw_dict.keys()))
    #     # for key in release_hw_dict.keys():
    #     #     logging.debug("Release hardware: %s" %(release_hw_dict[key]))
    # except Exception as err:
    #     logging.debug(err, exc_info = True)

    release_hw_dict = get_home_info()
    logging.debug("Release hardware: %s" % (release_hw_dict))