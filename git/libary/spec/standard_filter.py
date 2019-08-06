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

# from Performance import settings


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


def get_keyword_values(cursor, sql, keyword=None):
    values = []
    count = cursor.execute(sql)
    if count != 0:
        results = cursor.fetchall()
        for element in results:
            if keyword == "version":
                values.append(element[0].upper())
            else:
                values.append(element[0])
    return values


def get_box_values(cursor, benchmark, keyword):
    if keyword == "last_update":
        sql = "select display from filter_time"
        return get_keyword_values(cursor, sql)
    elif keyword == "speed":
        sql = "select distinct speed from iperf order by speed"
        return get_keyword_values(cursor, sql)
    elif keyword == "disk_type":
        sql = "select distinct disk_type from fio order by disk_type"
        return get_keyword_values(cursor, sql)
    else:
        sql = "select distinct %s from filter_view where testcase_name = '%s' order by %s desc" % (
            keyword, benchmark, keyword)
        return get_keyword_values(cursor, sql, keyword=keyword)


# version, soc, platform
def get_special_box(cursor, benchmark, keyword):
    release_dict = collections.OrderedDict()
    if keyword == "version":
        sql = "select version from release_version where version like 'hsrp%' order by version desc"
    else:
        sql = "select distinct %s from filter_view where version like 'hsrp%%' and testcase_name = '%s' order by %s desc" % (
        keyword, benchmark, keyword)
    release_dict['hsrp'] = get_keyword_values(cursor, sql, keyword=keyword)

    if keyword == "version":
        sql = "select version from release_version where version not like 'hsrp%' order by version desc"
    else:
        sql = "select distinct %s from filter_view where version not like 'hsrp%%' and testcase_name = '%s' order by %s desc" % (
        keyword, benchmark, keyword)
    release_dict['reference_data'] = get_keyword_values(cursor, sql, keyword=keyword)
    return release_dict


# benchmark: speccpu, specjbb, lmbench, iperf, fio
def obtain_default_boxes(benchmark):
    benchmark = benchmark.lower()
    default_boxes = collections.OrderedDict()

    conn = connect_database()
    cursor = conn.cursor()
    # get keywords
    sql = "select name from v_testcase_keyword where default_keyword = '1' and testcase_name = '%s' order by priority" % (
        benchmark)
    keywords = get_keyword_values(cursor, sql)

    if keywords:
        for keyword in keywords:
            keyword = keyword.lower()
            if keyword in ('version', 'cpu_type', 'board_type'):
                default_boxes[keyword] = get_special_box(cursor, benchmark, keyword)
            else:
                default_boxes[keyword] = get_box_values(cursor, benchmark, keyword)
    else:
        raise Exception("Warning: the %s isn't associated with keywords" % (benchmark))

    conn.close()
    cursor.close()
    return default_boxes


def obtain_extra_keywords(benchmark):
    benchmark = benchmark.lower()
    extra_keywords = []
    conn = connect_database()
    cursor = conn.cursor()

    sql = "select name from v_testcase_keyword where default_keyword = '0' and testcase_name = '%s' order by priority" % (
        benchmark)
    extra_keywords = get_keyword_values(cursor, sql)

    conn.close()
    cursor.close()
    return extra_keywords


def obtain_extra_box(benchmark, keyword):
    benchmark = benchmark.lower()
    keyword = keyword.lower()
    extra_box = collections.OrderedDict()

    conn = connect_database()
    cursor = conn.cursor()

    extra_box[keyword] = get_box_values(cursor, benchmark, keyword)

    conn.close()
    cursor.close()
    return extra_box


def connect_keywords(cursor, benchmark, titles):
    sql = "select name from v_testcase_keyword where testcase_name = '%s' order by priority" % (benchmark)
    count = cursor.execute(sql)

    if count == 0:
        raise Exception()
    else:
        sql = "select distinct id, "
        for element in cursor.fetchall():
            sql = sql + element[0] + ", "
            titles.append(element[0])
        return sql.rstrip(', ')


def connect_conditions(conditions_dict):
    conditions = ""
    for key in conditions_dict.keys():
        if key == "last_update":
            conditions = conditions + key + " between date_sub(now(), interval %s) and now()" % (
                conditions_dict[key]) + " and "
        else:
            if len(conditions_dict[key]) == 1:
                conditions = conditions + key + " = '%s' and " % (conditions_dict[key][0])
            else:
                conditions = conditions + key + " in " + str(tuple(conditions_dict[key])) + " and "
    return conditions


def obtain_query_results(conditions_dict, benchmark):
    benchmark = benchmark.lower()
    query_results = collections.OrderedDict()
    titles = []

    logging.debug("Connect the database")
    conn = connect_database()
    cursor = conn.cursor()

    if benchmark == "iperf":
        sql = connect_keywords(cursor, benchmark, titles) + " from v_iperf_filter where "
    elif benchmark == "fio":
        sql = connect_keywords(cursor, benchmark, titles) + " from v_fio_filter where "
    else:
        sql = connect_keywords(cursor, benchmark, titles) + " from filter_view where "

    if len(conditions_dict) != 0:
        sql = sql + connect_conditions(conditions_dict)
    sql = sql + "testcase_name = '%s'" % (
        benchmark) + " order by version desc, cpu_type desc, board_type desc, total_threads desc, last_update desc"

    logging.debug("SQL: %s" % (sql))

    count = cursor.execute(sql)
    if count != 0:
        query_results['title'] = titles
        for element in cursor.fetchall():
            results = list(element)
            if "version" in titles:
                index = titles.index("version")
                results[index + 1] = results[index + 1].upper()
            for i in range(0, len(results)):
                if isinstance(results[i], datetime.datetime):
                    results[i] = results[i].strftime("%Y-%m-%d %H:%M:%S")
            if results[0] not in query_results.keys():
                query_results[results[0]] = results[1:]
            else:
                query_result = query_results[results[0]]
                for i in range(0, len(query_result)):
                    if query_result[i] == results[i + 1]:
                        pass
                    else:
                        query_result[i] = query_result[i] + "/" + results[i + 1]
        logging.debug("Query Results: %s" % (query_results))

    cursor.close()
    conn.close()
    return query_results


def get_data_from_database(cursor, sql, benchmark):
    data = collections.OrderedDict()
    count = cursor.execute(sql)
    field_names = cursor.description
    if count != 0:
        for element in cursor.fetchall():
            for i in range(0, len(element)):
                key = field_names[i][0]
                value = element[i]
                if benchmark == "speccpu":
                    if key == "specint_score" or key == "specfp_score":
                        key = key.replace('_', ' ')
                    else:
                        key = key.replace('_', '.')
                elif benchmark == "specjbb":
                    key = key.replace('_', ' ')
                else:
                    pass

                if key not in data.keys():
                    data[key] = []
                if value is None or float(value) == -1:
                    data[key].append('N/A')
                else:
                    data[key].append(float(value))
    return data


def get_info_from_database(cursor, sql, info_type):
    data = collections.OrderedDict()
    count = cursor.execute(sql)
    field_names = cursor.description
    if count != 0:
        for element in cursor.fetchall():
            for i in range(0, len(element)):
                key = field_names[i][0]
                value = element[i]
                if info_type == "hardware":
                    if key == "cpu_type":
                        key = "CPU_Type"
                    elif key == "board_type":
                        key = "Platform"
                    elif key == "netcard_info":
                        key = "NIC_Info"
                    elif key == "pci_info":
                        key = "PCIe_Info"
                    else:
                        key = key.title()
                elif info_type == "software":
                    if key == "kernel":
                        key = "Linux_Kernel"
                    elif key == "lmbench" or key == "iperf":
                        key = key.title()
                    else:
                        key = key.upper()
                else:
                    key = key.title()

                if key not in data.keys():
                    data[key] = []
                if value is None or value == ' ':
                    value = 'N/A'
                data[key].append(value)
    return data


def get_iperf_data(cursor, testcase_exec_id, conditions_dict):
    data = collections.OrderedDict()
    sql = "select speed, bi_bandwidth, uni_bandwidth from iperf where testcase_execution_id = %s " % (testcase_exec_id)
    if conditions_dict:
        sql = sql + " and " + connect_conditions(conditions_dict).rstrip(" and ")
    logging.debug("Iperf SQL: %s" % sql)
    count = cursor.execute(sql)

    if count != 0:
        for speed, bi_bandwidth, uni_bandwidth in cursor.fetchall():
            if speed not in data.keys():
                data[speed] = collections.OrderedDict()
            if bi_bandwidth is None or float(bi_bandwidth) == -1:
                pass
            else:
                data[speed]['bi_direction(Gbps)'] = [float(bi_bandwidth)]
            if uni_bandwidth is None or float(uni_bandwidth) == -1:
                pass
            else:
                data[speed]['uni_direction(Gbps)'] = [float(uni_bandwidth)]
    return data


def get_fio_data(cursor, testcase_exec_id, conditions_dict):
    form = collections.OrderedDict()
    figure = collections.OrderedDict()
    sql = "select disk_type, iodepth, mode, block_size, threads, bandwidth, iops from fio where testcase_execution_id = %s " % (
        testcase_exec_id)

    if conditions_dict:
        sql = sql + " and " + connect_conditions(conditions_dict).rstrip(" and ") + " order by disk_type"
    else:
        sql = sql + " order by disk_type"
    logging.debug("FIO SQL: %s" % sql)
    count = cursor.execute(sql)

    if count != 0:
        results = cursor.fetchall()
        form = get_fio_form(results)
        figure = get_fio_figure(results)
    return form, figure


def get_fio_form(results):
    data = collections.OrderedDict()
    for disk_type, iodepth, mode, bs, threads, bandwidth, iops in results:
        key = mode.title() + "-" + bs + "-" + threads + "threads"
        if disk_type not in data.keys():
            data[disk_type] = collections.OrderedDict()
        if iodepth not in data[disk_type].keys():
            data[disk_type][iodepth] = collections.OrderedDict()
        if key not in data[disk_type][iodepth].keys():
            data[disk_type][iodepth][key] = collections.OrderedDict()
        if mode == 'read' or mode == 'write':
            data[disk_type][iodepth][key]["Bandwidth(MB/s)"] = [float(bandwidth)]
        else:
            data[disk_type][iodepth][key]["IOPS(k)"] = [float(iops)]
    return data


def get_fio_figure(results):
    data = collections.OrderedDict()
    for disk_type, iodepth, mode, bs, threads, bandwidth, iops in results:
        key = mode.title() + "-" + bs + "-" + threads + "threads-iodepth" + iodepth
        if disk_type not in data.keys():
            data[disk_type] = collections.OrderedDict()
        if mode == "read" or mode == "write":
            reference = "Bandwidth(MB/s)"
            value = float(bandwidth)
        else:
            reference = "IOPS(k)"
            value = float(iops)
        if reference not in data[disk_type].keys():
            data[disk_type][reference] = collections.OrderedDict()
        data[disk_type][reference][key] = [value]
    return data


def get_standard_data(cursor, testcase_exec_id, benchmark):
    standard_data = collections.OrderedDict()
    if benchmark == "speccpu":
        sql = "select specint_score, 400_perlbench, 401_bzip2, 403_gcc, 429_mcf, 445_gobmk, 456_hmmer, 458_sjeng,  462_libquantum, \
                464_H264ref, 471_omnetpp, 473_astar, 483_xalancbmk from spec_cpu_int where testcase_execution_id = %s " % (
            testcase_exec_id)
        data = get_data_from_database(cursor, sql, benchmark)
        if len(data) != 0:
            standard_data['int'] = data

        sql = "select specfp_score, 410_bwaves, 416_gamess, 433_milc, 434_zeusmp, 435_gromacs, 436_cactusADM, 437_leslie3d, 444_namd, \
                447_dealll, 450_soplex, 453_poveray, 454_calculix, 459_gemsfdtd, 465_tonto, 470_lbm, 481_wrf, 482_spinx3 from spec_cpu_fp \
                where testcase_execution_id = %s " % (testcase_exec_id)
        data = get_data_from_database(cursor, sql, benchmark)
        if len(data) != 0:
            standard_data['fp'] = data

    elif benchmark == "specjbb":
        sql = "select max_jops, critical_jops from spec_jbb where testcase_execution_id = %s " % (testcase_exec_id)
        standard_data = get_data_from_database(cursor, sql, benchmark)

    elif benchmark == "lmbench-stream":
        sql = "select l1cache, l2cache, l3cache, memory from lmbench where factors = '%s' and testcase_execution_id = %s " % (
            benchmark, testcase_exec_id)
        standard_data = get_data_from_database(cursor, sql, benchmark)

    elif benchmark == "lmbench-latency":
        sql = "select l1cache, l2cache, l3cache, memory from lmbench where factors = '%s' and testcase_execution_id = %s " % (
            benchmark, testcase_exec_id)
        standard_data = get_data_from_database(cursor, sql, benchmark)
    else:
        pass

    logging.debug("Standerd Data: %s" % (standard_data))
    return standard_data


def get_hw_info(cursor, testcase_exec_id):
    sql = "select cpu_type, total_socket, cores_per_socket, threads_per_core, total_threads, cpu_frequency, cpu_max_frequency, cpu_min_frequency, \
            l1_cache_size, l2_cache_size, l3_cache_size, board_type, memory_total_size, total_memory, memory_speed, memory_configured_clock, netcard_info, \
            disk_info, pci_info from hardware_conf h, testcase_execution t where h.id = t.hw_config_id and t.id = %s" % (
        testcase_exec_id)
    return get_info_from_database(cursor, sql, 'hardware')


def get_sw_info(cursor, testcase_exec_id):
    sql = "select os, kernel, bios, gcc, glibc, jdk, spec_cpu, spec_jbb, lmbench, iperf, fio from software_conf s, testcase_execution t \
            where s.id = t.sw_config_id and t.id = %s" % (testcase_exec_id)
    return get_info_from_database(cursor, sql, 'software')


def get_tune_info(cursor, testcase_exec_id):
    sql = "select cpu_avaiable_govorner, cpu_current_govorner, irq_balance_status, tuned_profile, firewall_status, auditd_status \
            from tune_conf c, testcase_execution t where c.id = t.tune_config_id and t.id = %s" % (
        testcase_exec_id)
    return get_info_from_database(cursor, sql, 'tune')


def get_tune_customization(cursor, testcase_exec_id):
    sql = "select customization from tune_conf c, testcase_execution t where c.id = t.tune_config_id and t.id = %s" % (
        testcase_exec_id)
    return get_info_from_database(cursor, sql, 'tune')


def get_title(cursor, testcase_exec_id):
    sql = "select version, board_type, cpu_type, total_threads, last_update from filter_view where id = %s" % (
        testcase_exec_id)
    count = cursor.execute(sql)
    if count == 1:
        release, platform, soc, threads, upload = cursor.fetchone()
        return release.upper() + "_" + platform + "_" + soc + "_" + threads + "," + upload.strftime("%Y-%m-%d %H:%M:%S")
    else:
        raise Exception("Error: no hardware information is associated. Testcase Exec Id: %s" % (testcase_exec_id))
        return " "


def obtain_detail_data(testcase_exec_id_list, benchmark, conditions_dict=None):
    results = collections.OrderedDict()
    benchmark = benchmark.lower()
    logging.debug("Connect the database")
    conn = connect_database()
    cursor = conn.cursor()

    for testcase_exec_id in testcase_exec_id_list:
        if testcase_exec_id not in results.keys():
            results[testcase_exec_id] = collections.OrderedDict()
        if benchmark != 'fio':
            if benchmark != 'iperf':
                data = get_standard_data(cursor, testcase_exec_id, benchmark)
            else:
                data = get_iperf_data(cursor, testcase_exec_id, conditions_dict)
            results[testcase_exec_id]['standard_data_form'] = data
            results[testcase_exec_id]['standard_data_figure'] = data
        else:
            form, figure = get_fio_data(cursor, testcase_exec_id, conditions_dict)
            results[testcase_exec_id]['standard_data_form'] = form
            results[testcase_exec_id]['standard_data_figure'] = figure

        results[testcase_exec_id]['standard_hard_config'] = get_hw_info(cursor, testcase_exec_id)
        results[testcase_exec_id]['standard_soft_config'] = get_sw_info(cursor, testcase_exec_id)
        results[testcase_exec_id]['standard_tune'] = get_tune_info(cursor, testcase_exec_id)
        results[testcase_exec_id]['standard_tune_customization'] = get_tune_customization(cursor, testcase_exec_id)
        try:
            results[testcase_exec_id]['standard_title'] = get_title(cursor, testcase_exec_id)
        except Exception as err:
            raise err
    cursor.close()
    conn.close()
    return results


def obtain_latest_data(benchmark, conditions_dict=None):
    latest_results = collections.OrderedDict()
    benchmark = benchmark.lower()
    conn = connect_database()
    cursor = conn.cursor()

    sql = "select id from filter_view where testcase_name = '%s' order by last_update desc" % (benchmark)
    count = cursor.execute(sql)
    if count != 0:
        testcase_exec_id = cursor.fetchone()[0]
        latest_results[testcase_exec_id] = collections.OrderedDict()
        if benchmark != 'fio':
            if benchmark != 'iperf':
                data = get_standard_data(cursor, testcase_exec_id, benchmark)
            else:
                data = get_iperf_data(cursor, testcase_exec_id, conditions_dict)
            latest_results[testcase_exec_id]['standard_data_form'] = data
            latest_results[testcase_exec_id]['standard_data_figure'] = data
        else:
            form, figure = get_fio_data(cursor, testcase_exec_id, conditions_dict)
            latest_results[testcase_exec_id]['standard_data_form'] = form
            latest_results[testcase_exec_id]['standard_data_figure'] = figure

        latest_results[testcase_exec_id]['standard_hard_config'] = get_hw_info(cursor, testcase_exec_id)
        latest_results[testcase_exec_id]['standard_soft_config'] = get_sw_info(cursor, testcase_exec_id)
        latest_results[testcase_exec_id]['standard_tune'] = get_tune_info(cursor, testcase_exec_id)
        latest_results[testcase_exec_id]['standard_tune_customization'] = get_tune_customization(cursor, testcase_exec_id)
        try:
            latest_results[testcase_exec_id]['standard_title'] = get_title(cursor, testcase_exec_id)
        except Exception as err:
            raise err
    cursor.close()
    conn.close()
    return latest_results


def update_tune_customization(tune_customization_dict):
    conn = connect_database()
    cursor = conn.cursor()

    try:
        for key in tune_customization_dict.keys():
            sql = "update tune_conf set customization = '%s' where id in (select tune_config_id from testcase_execution where id = '%s')" % (
            tune_customization_dict[key], key)
            cursor.execute(sql)
    except Exception as err:
        raise err
        conn.rollback()
    else:
        conn.commit()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    logger = logging_conf(level=logging.DEBUG)

    # conditions_dict = {'version':['hsrp1.5']}
    # results = obtain_query_results(conditions_dict, 'fio')
    # logging.debug("Results: %s" %(results))

    # conn = connect_database()
    # cursor = conn.cursor()

    # results = get_iperf_data(cursor, 181, None)
    # logger.debug("Testing Result: %s" % (results))

    # results = get_iperf_data(cursor, 181, {"speed":['100G']})
    # logger.debug("Testing Result: %s" % (results))

    # cursor.close()
    # conn.close()

    # results = obtain_detail_data([183, 184], 'fio')
    # logging.debug("Results: %s" %(results))

    # tune_customization_dict = {"160":"gcc version: gcc-6.3.1", '178': 'gcc version: gcc-6.2.3'}
    # update_tune_customization(tune_customization_dict)

    results = obtain_default_boxes('fio')
    logging.debug("Results: %s" % (results))





