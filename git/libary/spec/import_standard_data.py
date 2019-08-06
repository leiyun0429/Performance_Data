# ==================================================================================
# Author: Guo Yao <yao.guo@hxt-semitech.com>
# Initial creation: 2018.09.11
# Description:
# Copyright (c) 2018 Huaxintong Semiconductor Technology Co.,Ltd.
# All Rights Reserved.
# Confidential and Proprietary - Huaxintong Semiconductor Technology Co.,Ltd.
# ==================================================================================

import os
import re
import logging
import collections
import configparser
from queue import Queue
from functools import reduce
from Performance import settings
import pymysql


def _is_number(data):
    pattern = re.compile(r'^0$|^[1-9]\d*$|^0\.\d+$|^[1-9]\d*\.\d+$')
    result = pattern.match(data)
    if result:
        return True
    else:
        return False


def get_user_id(cursor, employee_number):
    sql = "select id from user where employee_id = '%s'" % (employee_number)
    count = cursor.execute(sql)
    if count == 0:
        raise Exception("The employee number(%s) does not exist" % (employee_number))
    else:
        return cursor.fetchone()[0]


def get_release_version_id(cursor, release_version):
    sql = "select id from release_version where version='%s'" % (release_version)
    count = cursor.execute(sql)
    if count == 0:
        raise Exception("The release version(%s) does not exist" % (release_version))
    else:
        return cursor.fetchone()[0]


def get_testcase_id(cursor, testcase):
    logging.debug("Testcase: %s" % (testcase))
    sql = "select id from testcase where testcase_name='%s'" % (testcase)
    count = cursor.execute(sql)
    if count == 0:
        raise Exception("The testcase(%s) does not exist" % (testcase))
    else:
        return cursor.fetchone()[0]


def get_soc(cursor, release_version):
    soc_list = []
    sql = "select distinct name from v_release_soc where version = '%s'" % (release_version)
    count = cursor.execute(sql)
    if count == 0:
        raise Exception("The %s isn't associated with the soc")
    else:
        for element in cursor.fetchall():
            soc_list.append(element[0])
        return soc_list


def get_platform(cursor, release_version):
    platform_list = []
    sql = "select distinct name from v_release_platform where version = '%s'" % (release_version)
    count = cursor.execute(sql)
    if count == 0:
        raise Exception("The %s isn't associated with the platform")
    else:
        for element in cursor.fetchall():
            platform_list.append(element[0])
        return platform_list


def insert_hw_table(hw_conf, connection, cursor):
    sql = "insert into hardware_conf(board_type, cpu_type, total_socket, cores_per_socket, threads_per_core, \
                    total_threads, cpu_frequency, cpu_max_frequency, cpu_min_frequency, l1_cache_size, l2_cache_size, \
                    l3_cache_size, memory_total_size, total_memory, memory_speed, memory_configured_clock, \
                    netcard_info, disk_info, pci_info) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, \
                    %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    try:
        cursor.execute(sql, tuple(hw_conf))
    except Exception as err:
        raise err
    else:
        return connection.insert_id()


def insert_sw_table(sw_conf, connection, cursor):
    sql = "insert into software_conf(os, kernel, bios, gcc, glibc, jdk, spec_cpu, spec_jbb, lmbench, iperf, fio)  \
                    values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    try:
        cursor.execute(sql, tuple(sw_conf))
    except Exception as err:
        raise err
    else:
        return connection.insert_id()


def insert_tune_table(tune_conf, connection, cursor):
    sql = "insert into tune_conf(cpu_avaiable_govorner, cpu_current_govorner, irq_balance_status, tuned_profile, firewall_status, \
                    auditd_status) values(%s, %s, %s, %s, %s, %s)"
    try:
        cursor.execute(sql, tuple(tune_conf))
    except Exception as err:
        raise err
    else:
        return connection.insert_id()


def update_tune_table(tune_with_path, connection, cursor, tune_config_id):
    sql = "update tune_conf set customization = %s where id = %s"
    content = ""
    with open(tune_with_path, "r") as f:
        try:
            for line in f.readlines():
                content += line.replace("\n", ";")
            cursor.execute(sql, (content, tune_config_id))
        except Exception as err:
            raise err


def get_items_values(cfg, section):
    lists = []
    items = cfg.items(section)
    for j in range(len(items)):
        key, value = items[j]
        lists.append(value)
    return lists


def transform_caches(cache_size_with_unit):
    cache_size_without_uint = {}
    for key in cache_size_with_unit.keys():
        if key == "L1_cache":
            if "/" in cache_size_with_unit[key]:
                L1_cache_list = cache_size_with_unit[key].split("/")
                cache_size_without_uint["L1d_cache"] = float(re.sub("[a-zA-Z]", "", L1_cache_list[0]))
                cache_size_without_uint["L1i_cache"] = float(re.sub("[a-zA-Z]", "", L1_cache_list[1]))
        else:
            cache_size_without_uint[key] = float(re.sub("[a-zA-Z]", "", cache_size_with_unit[key]))
    return cache_size_without_uint


def write_env_conf(env_with_path, connection, cursor, tune_with_path, release_version):
    try:
        soc_list = get_soc(cursor, release_version)
        platform_list = get_platform(cursor, release_version)

        logging.debug("SoC: %s" % (soc_list))
        logging.debug("Platform: %s" % (platform_list))

    except Exception as err:
        raise err
    else:
        cache_size_with_unit = {}

        with open(env_with_path, "r") as fr:
            cfg = configparser.ConfigParser()
            cfg.readfp(fr)

            if (cfg['Hardware Configuration']['CPU_Type'] not in soc_list) or (
                    cfg['Hardware Configuration']['Platform'] not in platform_list):
                raise Exception("The %s or %s isn't available in the %s" % (
                cfg['Hardware Configuration']['CPU_Type'], cfg['Hardware Configuration']['Platform'], release_version))
            else:
                cfg['Hardware Configuration']['NIC_Info'] = re.sub(r'\n', '', cfg['Hardware Configuration'][
                    'NIC_Info']).replace(r'"', '')
                cfg['Hardware Configuration']['Disk_Info'] = re.sub(r'\n', '',
                                                                    cfg['Hardware Configuration']['Disk_Info']).replace(
                    r'"', '')
                cfg['Hardware Configuration']['PCIe_Info'] = re.sub(r'\n', '',
                                                                   cfg['Hardware Configuration']['PCIe_Info']).replace(
                    r'"', '')

                # Get L1, L2, L3 Cache Size
                cache_size_with_unit['L1_cache'] = cfg['Hardware Configuration']['L1_Cache_Size']
                cache_size_with_unit['L2_cache'] = cfg['Hardware Configuration']['L2_Cache_Size']
                cache_size_with_unit['L3_cache'] = cfg['Hardware Configuration']['L3_Cache_Size']

                logging.debug("Caches Size: %s" % (cache_size_with_unit))

                sections = cfg.sections()
                logging.debug("Sections: %s" % (sections))

                hw_conf = []
                sw_conf = []
                tune_conf = []

                for i in range(len(sections)):
                    if sections[i].lower() == "hardware configuration":
                        hw_conf = get_items_values(cfg, sections[i])
                    elif sections[i].lower() == "software configuration":
                        sw_conf = get_items_values(cfg, sections[i])
                    elif sections[i].lower() == "tune configuration":
                        tune_conf = get_items_values(cfg, sections[i])
                    else:
                        continue

                logging.debug("Hardware Configuration: %s" % (hw_conf))
                logging.debug("Software Configuration: %s" % (sw_conf))
                logging.debug("Tune Configuration: %s" % (tune_conf))

                try:
                    hw_config_id = insert_hw_table(hw_conf, connection, cursor)
                    sw_config_id = insert_sw_table(sw_conf, connection, cursor)
                    tune_config_id = insert_tune_table(tune_conf, connection, cursor)
                    if tune_with_path:
                        update_tune_table(tune_with_path, connection, cursor, tune_config_id)
                except Exception as err:
                    raise err
                else:
                    return hw_config_id, sw_config_id, tune_config_id, cache_size_with_unit


def insert_testcase_exec_table(connection, cursor, user_id, testcase_id, release_id, hw_config_id, sw_config_id,
                               tune_config_id, original):
    sql = "insert into testcase_execution(user_id, testcase_id, release_id, hw_config_id, sw_config_id, tune_config_id, \
            filename, original_data_path) values(%s, %s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(sql,
                   (user_id, testcase_id, release_id, hw_config_id, sw_config_id, tune_config_id, original, original))
    return connection.insert_id()


def check_file(filename):
    if os.path.exists(filename):
        if os.path.getsize(filename):
            return True
        else:
            raise Exception("The %s is empty" % (filename))
    else:
        raise Exception("The %s doesn't exist" % (filename))
    return False


def write_tables(csv_with_path, env_with_path, original_with_path, tune_with_path, employee_number, release_version,
                 connection):
    netcard_and_disk = ""
    try:
        if check_file(csv_with_path):
            if "/" in csv_with_path:
                csv_filename = csv_with_path.split("/")[-1]
            else:
                csv_filename = csv_with_path

            logging.debug("CSV filename: %s" % (csv_filename))
            testcase, extension = os.path.splitext(csv_filename)
            testcase = testcase.lower()

            logging.debug("The extension of CSV file: %s" % (extension))
            if extension != r".csv":
                raise Exception("The CSV's extension Error: %s" % (extension))

        if check_file(env_with_path):
            if "/" in env_with_path:
                env_filename = env_with_path.split("/")[-1]
            else:
                env_filename = env_with_path

            logging.debug("ENV filename: %s" % (env_filename))
            basename, extension = os.path.splitext(env_filename)
            if extension != r".ini":
                raise Exception("Extension Error: %s" % (extension))

        if check_file(original_with_path):
            if "/" in original_with_path:
                original = original_with_path.split("/")[-1]
            else:
                original = original_with_path

        if tune_with_path:
            check_file(tune_with_path)
            if "/" in tune_with_path:
                tune_filename = tune_with_path.split("/")[-1]
            else:
                tune_filename = tune_with_path
            basename, extension = os.path.splitext(tune_filename)
            if extension != r".txt":
                raise Exception("Extension Error: %s" % (extension))

    except Exception as err:
        raise err
    else:
        cursor = connection.cursor()
        try:
            user_id = get_user_id(cursor, employee_number)
            logging.debug("User Id: %d" % (user_id))

            testcase_id = get_testcase_id(cursor, testcase)
            logging.debug("Testcase Id: %d" % (testcase_id))

            release_id = get_release_version_id(cursor, release_version)
            logging.debug("Release Version Id: %d" % (release_id))

            hw_config_id, sw_config_id, tune_config_id, cache_size_with_unit = write_env_conf(env_with_path, connection,
                                                                                         cursor, tune_with_path,
                                                                                         release_version)
            logging.debug("HW Configure Id: %d, SW Configure Id: %d, Tune Configure Id: %d, Cache Sizes: %s" % (
            hw_config_id, sw_config_id, tune_config_id, cache_size_with_unit))

            testcase_exec_id = insert_testcase_exec_table(connection, cursor, user_id, testcase_id, release_id,
                                                          hw_config_id, sw_config_id, tune_config_id, original)
            logging.debug("Testcase Exec Id: %d" % (testcase_exec_id))

            if re.match(r"fio", testcase):
                insert_fio_table(csv_with_path, cursor, testcase_exec_id)
            elif re.match(r"speccpu", testcase):
                insert_spec_cpu_table(csv_with_path, cursor, testcase_exec_id)
            elif re.match(r"iperf", testcase):
                insert_iperf_table(csv_with_path, cursor, testcase_exec_id)
            elif re.match(r"specjbb", testcase):
                insert_spec_jbb_table(csv_with_path, cursor, testcase_exec_id)
            elif re.match(r"lmbench-stream", testcase):
                lmbench_id = insert_lmbench_table(connection, cursor, testcase_exec_id, testcase)
                lmbench_geomeans = insert_lmbench_stream_table(csv_with_path, connection, cursor, lmbench_id)
                update_lmbench_table(cursor, lmbench_id, lmbench_geomeans)
            elif re.match(r"lmbench-latency", testcase):
                lmbench_id = insert_lmbench_table(connection, cursor, testcase_exec_id, testcase)
                lmbench_latency = insert_lmbench_latency_table(csv_with_path, cursor, lmbench_id, cache_size_with_unit)
                update_lmbench_table(cursor, lmbench_id, lmbench_latency)
            else:
                pass
            connection.commit()
            return tune_config_id
        except Exception as err:
            raise err
            connection.rollback()
        finally:
            cursor.close()


def insert_fio_table(csv_with_path, cursor, testcase_exec_id):
    sql = "insert into fio(testcase_execution_id, disk_type, ioengine, iodepth, mode, block_size, threads, bandwidth, iops, latency) \
            values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

    _is_read_title_line = True
    line_number = 0

    with open(csv_with_path, "r") as f:
        try:
            for line in f.readlines():
                line_number += 1
                if _is_read_title_line:
                    _is_read_title_line = False
                    continue
                else:
                    partial_data = []
                    lists = line.strip("\n").split(",")
                    logging.debug("Fio Data: %s" % (lists))

                    if re.match(r"NVMe", lists[0], flags=re.IGNORECASE):
                        disk = "NVMe"
                    elif re.match(r"SSD", lists[0], flags=re.IGNORECASE) or re.match(r"HDD", lists[0],
                                                                                     flags=re.IGNORECASE):
                        disk = lists[0].upper()
                    else:
                        raise Exception("Disk Type Error: %s" % (lists[0]))

                    for element in lists[6:]:
                        if element:
                            if _is_number(element):
                                partial_data.append(float(element))
                            elif element.upper() == r"N/A":
                                partial_data.append(-1)
                            else:
                                raise Exception("Data Error: line %d in the %s" % (line_number, csv_with_path))
                        else:
                            raise Exception("Data Missing: line %d in the %s" % (line_number, csv_with_path))
                    data = [testcase_exec_id] + [disk] + lists[1:6] + partial_data
                    cursor.execute(sql, tuple(data))
        except Exception as err:
            raise err


def insert_spec_cpu_table(csv_with_path, cursor, testcase_exec_id):
    sql_int = "insert into spec_cpu_int(testcase_execution_id, specint_score, 400_perlbench, 401_bzip2, 403_gcc, 429_mcf, 445_gobmk, 456_hmmer, \
                458_sjeng, 462_libquantum, 464_h264ref, 471_omnetpp, 473_astar, 483_xalancbmk) values(%s, %s, %s, %s, %s, %s, \
                %s, %s, %s, %s, %s, %s, %s, %s)"
    sql_fp = "insert into spec_cpu_fp(testcase_execution_id, specfp_score, 410_bwaves, 416_gamess, 433_milc, 434_zeusmp, 435_gromacs, 436_cactusADM, \
                437_leslie3d, 444_namd, 447_dealll, 450_soplex, 453_poveray, 454_calculix, 459_GemsFDTD, 465_tonto, 470_lbm, \
                481_wrf, 482_spinx3) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    _is_read_first_line = True
    _is_read_second_line = True
    line_number = 0
    with open(csv_with_path, "r") as f:
        try:
            for line in f.readlines():
                line_number += 1
                if _is_read_first_line:
                    _is_read_first_line = False
                    continue
                else:
                    if _is_read_second_line:
                        _is_read_second_line = False
                        continue
                    else:
                        data = []
                        lists = line.strip("\n").split(",")
                        logging.debug("Spec CPU Data: %s" % (lists))
                        for element in lists[1:]:
                            if element:
                                if _is_number(element):
                                    data.append(float(element))
                                elif element.upper() == r"N/A":
                                    data.append(-1)
                                else:
                                    raise Exception("Data Error: line %d in the %s" % (line_number, csv_with_path))
                            else:
                                raise Exception("Data Missing: line %d in the %s" % (line_number, csv_with_path))
                        if lists[0] == "int":
                            cursor.execute(sql_int, tuple([testcase_exec_id] + data))
                        elif lists[0] == "fp":
                            cursor.execute(sql_fp, tuple([testcase_exec_id] + data))
                        else:
                            raise Exception("DataType Error: %s" % (lists))
        except Exception as err:
            raise err


def insert_spec_jbb_table(csv_with_path, cursor, testcase_exec_id):
    sql = "insert into spec_jbb(testcase_execution_id, max_jops, critical_jops) values(%s, %s, %s)"
    _is_read_first_line = True
    line_number = 0
    with open(csv_with_path, "r") as f:
        try:
            for line in f.readlines():
                line_number += 1
                if _is_read_first_line:
                    _is_read_first_line = False
                    continue
                else:
                    data = []
                    lists = line.strip("\n").split(",")
                    logging.debug("Sepc JBB Data: %s" % (lists))
                    for element in lists:
                        if element:
                            if _is_number(element):
                                data.append(float(element))
                            elif element.upper() == r"N/A":
                                data.append(-1)
                            else:
                                raise Exception("Data Error: line %d in the %s" % (line_number, csv_with_path))
                        else:
                            raise Exception("Data Missing: line %d in the %s" % (line_number, csv_with_path))
                    cursor.execute(sql, tuple([testcase_exec_id] + data))
        except Exception as err:
            raise err


def insert_iperf_table(csv_with_path, cursor, testcase_exec_id):
    sql = "insert into iperf(testcase_execution_id, speed, bi_bandwidth, uni_bandwidth) values(%s, %s, %s, %s)"
    _is_read_first_line = True
    data = collections.OrderedDict()
    line_number = 0
    with open(csv_with_path, "r") as f:
        try:
            for line in f.readlines():
                line_number += 1
                if _is_read_first_line:
                    _is_read_first_line = False
                    continue
                else:
                    lists = line.strip("\n").split(",")
                    logging.debug("Iperf Data: %s" % (lists))

                    NIC = lists[0].upper()
                    if NIC not in data.keys():
                        data[NIC] = collections.OrderedDict()
                        data[NIC]['bi-direction'] = None
                        data[NIC]['uni-direction'] = None

                    if lists[2]:
                        if _is_number(lists[2]):
                            data[NIC][lists[1]] = float(lists[2])
                        elif lists[2].upper() == r"N/A":
                            data[NIC][lists[1]] = -1
                        else:
                            raise Exception("Data Error: line %d in the %s" % (line_number, csv_with_path))
                    else:
                        raise Exception("Data Missing: line %d in the %s" % (line_number, csv_with_path))

            for NIC in data.keys():
                cursor.execute(sql, (testcase_exec_id, NIC, data[NIC]['bi-direction'], data[NIC]['uni-direction']))
        except Exception as err:
            raise err


def insert_lmbench_table(connection, cursor, testcase_exec_id, testcase):
    sql = "insert into lmbench(testcase_execution_id, factors) values(%s, %s)"
    try:
        cursor.execute(sql, (testcase_exec_id, testcase.lower()))
    except Exception as err:
        raise err
    else:
        return connection.insert_id()


def update_lmbench_table(cursor, lmbench_id, lmbench_data):
    sql = "update lmbench set l1cache = %s, l2cache = %s, l3cache = %s, memory = %s where id = %s"
    try:
        cursor.execute(sql, lmbench_data + [lmbench_id])
    except Exception as err:
        raise err


def insert_lmbench_stream_table(csv_with_path, connection, cursor, lmbench_id):
    lmbench_stream_sql = "insert into lmbench_stream(lmbench_id, process, size, operator, average) values (%s, %s, %s, %s, %s)"
    lmbench_stream_bw_sql = "insert into lmbench_stream_bw(lmbench_stream_id, bandwidth) values (%s, %s)"
    _is_read_first_line = True
    sizes = []
    averages = []
    lmbench_geomeans = []
    line_number = 0
    with open(csv_with_path, "r") as f:
        try:
            for line in f.readlines():
                line_number += 1
                if _is_read_first_line:
                    _is_read_first_line = False
                    continue
                else:
                    bandwidth = []
                    avg_bandwidth = []
                    lists = line.strip("\n").split(",")
                    logging.debug("Lmbench Stream Data: %s" % (lists))
                    if lists[1] not in sizes:
                        sizes.append(lists[1])
                    for element in lists[3:]:
                        if element:
                            if _is_number(element):
                                bandwidth.append(float(element))
                                avg_bandwidth.append(float(element))
                            elif element.upper() == r"N/A":
                                bandwidth.append(-1)
                            else:
                                raise Exception("Data Error: line %d in the %s" % (line_number, csv_with_path))
                        else:
                            raise Exception("Data Missing: line %d in the %s" % (line_number, csv_with_path))
                    averages.append(sum(avg_bandwidth) / len(avg_bandwidth))

                    cursor.execute(lmbench_stream_sql,
                                   [lmbench_id] + lists[0:3] + [sum(avg_bandwidth) / len(avg_bandwidth)])
                    lmbench_stream_id = connection.insert_id()
                    for element in bandwidth:
                        cursor.execute(lmbench_stream_bw_sql, (lmbench_stream_id, element))
            logging.debug("Lmbench Stream Sizes: %s" % (sizes))
            logging.debug("Lmbench Stream Averages: %s" % (averages))
            step = int(len(averages) / len(sizes))
            slices = []
            for i in range(len(sizes)):
                slices = averages[step * i:step * (i + 1)]
                logging.debug("Lmbench Stream Slices: %s" % (slices))
                lmbench_geomeans.append(round(reduce(lambda x, y: x * y, slices) ** (1.0 / len(slices)), 2))
            return lmbench_geomeans
        except Exception as err:
            raise err


# abandon the function
def get_latency_data(numbers):
    frequency_dict = {}
    for element in numbers:
        if str(element) in frequency_dict.keys():
            frequency_dict[str(element)] += 1
        else:
            frequency_dict[str(element)] = 1
    return max(frequency_dict, key=frequency_dict.get)


def queue_push_before_latency(value, latency_queue):
    if latency_queue.qsize() < 5:
        latency_queue.put_nowait(value)
    else:
        latency_queue.get_nowait()
        latency_queue.put_nowait(value)


def insert_lmbench_latency_table(csv_with_path, cursor, lmbench_id, cache_size_with_unit):
    sql = "insert into lmbench_latency(lmbench_id, array_size, stride16, stride32, stride64, stride128, stride256, stride512, \
            stride1024, stride2048, stride4096, stride8192) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

    line_number = 0
    lmbench_latency = []

    _is_read_first_line = True

    latency_queue = Queue(maxsize=5)
    latency_counter = {'L1_cache': 0, 'L2_cache': 0, 'L3_cache': 0}
    cache_and_memory_latency = {'L1_cache': [], 'L2_cache': [], 'L3_cache': [], 'memory': []}

    with open(csv_with_path, "r") as f:
        try:
            for line in f.readlines():
                line_number += 1
                if _is_read_first_line:
                    _is_read_first_line = False
                    continue
                else:
                    data = []
                    lists = line.strip("\n").split(",")
                    logging.debug("Lmbench Latency Data: %s" % (lists))
                    for element in lists:
                        if element:
                            if _is_number(element):
                                data.append(float(element))
                            elif element.upper() == r"N/A":
                                data.append(-1)
                            else:
                                raise Exception("Data Error: line %d in the %s" % (line_number, csv_with_path))
                        else:
                            raise Exception("Data Missing: line %d in the %s" % (line_number, csv_with_path))
                    cursor.execute(sql, tuple([lmbench_id] + data))

                    cache_size_without_unit = transform_caches(cache_size_with_unit)
                    if len(cache_size_without_unit) == 0:
                        raise Exception("")
                    else:
                        if data[0] <= cache_size_without_unit["L1d_cache"] + cache_size_without_unit["L1i_cache"]:
                            if data[-1] != -1:
                                if data[0] < cache_size_without_unit["L1i_cache"]/2:
                                    queue_push_before_latency(data[-1], latency_queue)
                                elif data[0] == cache_size_without_unit["L1i_cache"]/2:
                                    while not latency_queue.empty():
                                        cache_and_memory_latency["L1_cache"].append(latency_queue.get_nowait())
                                else:
                                    if latency_counter["L1_cache"] < 5:
                                        cache_and_memory_latency["L1_cache"].append(data[-1])
                                        latency_counter["L1_cache"] += 1

                        elif data[0] <= cache_size_without_unit["L2_cache"]:
                            if data[-1] != -1:
                                if data[0] < cache_size_without_unit["L2_cache"]/2:
                                    queue_push_before_latency(data[-1], latency_queue)
                                elif data[0] == cache_size_without_unit["L2_cache"]/2:
                                    while not latency_queue.empty():
                                        cache_and_memory_latency["L2_cache"].append(latency_queue.get_nowait())
                                else:
                                    if latency_counter["L2_cache"] < 5:
                                        cache_and_memory_latency["L2_cache"].append(data[-1])
                                        latency_counter["L2_cache"] += 1

                        elif data[0] <= cache_size_without_unit["L3_cache"]:
                            if data[-1] != -1:
                                if data[0] < cache_size_without_unit["L3_cache"]/2:
                                    queue_push_before_latency(data[-1], latency_queue)
                                elif data[0] == cache_size_without_unit["L3_cache"]/2:
                                    while not latency_queue.empty():
                                        cache_and_memory_latency["L3_cache"].append(latency_queue.get_nowait())
                                else:
                                    if latency_counter["L3_cache"] < 5:
                                        cache_and_memory_latency["L3_cache"].append(data[-1])
                                        latency_counter["L3_cache"] += 1
                        else:
                            if data[-1] != -1:
                                cache_and_memory_latency["memory"].append(data[-1])

            # print("L1 Cache Data: %s" % (cache_and_memory_latency["L1_cache"]))
            # print("L2 Cache Data: %s" % (cache_and_memory_latency["L2_cache"]))
            # print("L3 Cache Data: %s" % (cache_and_memory_latency["L3_cache"]))
            # print("Memory Data: %s" % (cache_and_memory_latency["memory"]))

            # logging.debug("L1 Cache Data: %s" % (cache_and_memory_latency["L1_cache"]))
            # logging.debug("L2 Cache Data: %s" % (cache_and_memory_latency["L2_cache"]))
            # logging.debug("L3 Cache Data: %s" % (cache_and_memory_latency["L3_cache"]))
            # logging.debug("Memory Data: %s" % (cache_and_memory_latency["memory"]))

            lmbench_latency.append(round(sum(cache_and_memory_latency["L1_cache"]) /
                                         len(cache_and_memory_latency["L1_cache"]), 3))
            lmbench_latency.append(round(sum(cache_and_memory_latency["L2_cache"]) /
                                         len(cache_and_memory_latency["L2_cache"]), 3))
            lmbench_latency.append(round(sum(cache_and_memory_latency["L3_cache"]) /
                                         len(cache_and_memory_latency["L3_cache"]), 3))
            lmbench_latency.append(cache_and_memory_latency["memory"][-1])

            print("Lmbench Latency: %s" %(lmbench_latency))

            return lmbench_latency

        except Exception as err:
            raise err


def web_update_tune_table(tune_content, connection, tune_config_id):
    sql = "update tune_conf set customization = %s where id = %s"
    cursor = connection.cursor()
    try:
        cursor.execute(sql, (tune_content, tune_config_id))
        connection.commit()
    except Exception as err:
        raise err
        connection.rollback()
    finally:
        cursor.close()


def import_data(csv_with_path, env_with_path, original_with_path, tune_content, employee_number, release_version):
    tune_with_path = None
    result = {}
    connection = pymysql.connect(host=settings.PF_DATABASES['HOST'], port=settings.PF_DATABASES['PORT'], user=settings.PF_DATABASES['USER'], passwd=settings.PF_DATABASES['PASSWORD'], db=settings.PF_DATABASES['NAME'], charset=settings.PF_DATABASES['CHARSET'])

    try:
        tune_config_id = write_tables(csv_with_path, env_with_path, original_with_path, tune_with_path, employee_number,
                                      release_version, connection)
        if len(tune_content) != 0:
            web_update_tune_table(tune_content, connection, tune_config_id)
    except Exception as err:
        result['flag'] = False
        result['message'] = err
    else:
        result['flag'] = True
        result['message'] = "Import data successfully"
    finally:
        connection.close()
        return result
