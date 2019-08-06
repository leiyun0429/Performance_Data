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


def get_spec_cpu(release, board_type, cpu_type, total_threads, cursor):
    spec_cpu = {}
    sql = "select c.specint_score from filter_view f, spec_cpu_int c where f.id = c.testcase_execution_id and f.version = '%s' and \
            f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads)
    count = cursor.execute(sql)
    if count != 0:
        spec_cpu['int'] = [float(cursor.fetchone()[0])]

    sql = "select c.specfp_score from filter_view f, spec_cpu_fp c where f.id = c.testcase_execution_id and f.version = '%s' and \
        f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads)
    count = cursor.execute(sql)
    if count != 0:
        spec_cpu['fp'] = [float(cursor.fetchone()[0])]
    return spec_cpu


def get_spec_jbb(release, board_type, cpu_type, total_threads, cursor):
    spec_jbb = {}
    sql = "select j.max_jops, j.critical_jops from filter_view f, spec_jbb j where f.id = j.testcase_execution_id and f.version = '%s' and \
        f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads)
    count = cursor.execute(sql)
    if count != 0:
        max_jops, critical_jops = cursor.fetchone()
        spec_jbb['max_jops'] = [float(max_jops)]
        spec_jbb['critical_jops'] = [float(critical_jops)]
    return spec_jbb


def get_lmbench(release, board_type, cpu_type, total_threads, cursor):
    lmbench = {}

    sql = "select l.memory from filter_view f, lmbench l where f.id = l.testcase_execution_id and f.version = '%s' and \
            f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' and l.factors = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads, 'lmbench-latency')
    count = cursor.execute(sql)
    if count != 0:
        lmbench['memory_latency(ns)'] = [float(cursor.fetchone()[0])]

    sql = "select l.memory from filter_view f, lmbench l where f.id = l.testcase_execution_id and f.version = '%s' and \
            f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' and l.factors = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads, 'lmbench-stream')
    count = cursor.execute(sql)
    if count != 0:
        lmbench['memory_stream(MB/s)'] = [float(cursor.fetchone()[0])]

    return lmbench


def get_iperf(release, board_type, cpu_type, total_threads, cursor):
    iperf = {}
    sql = "select i.bi_bandwidth, i.uni_bandwidth from filter_view f, iperf i where f.id = i.testcase_execution_id and f.version = '%s' and \
        f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads)
    count = cursor.execute(sql)
    if count != 0:
        bi_bandwidth, uni_bandwidth = cursor.fetchone()
        if bi_bandwidth is None:
            iperf['bi_direction(Gbps)'] = ['N/A']
        else:
            iperf['bi_direction(Gbps)'] = [float(bi_bandwidth)]
        if uni_bandwidth is None:
            iperf['uni_direction(Gbps)'] = ['N/A']
        else:
            iperf['uni_direction(Gbps)'] = [float(uni_bandwidth)]
    return iperf


def get_fio(release, board_type, cpu_type, total_threads, cursor):
    fio = {}
    disk_types = []
    modes = []

    sql = "select distinct o.disk_type from filter_view f, fio o where f.id = o.testcase_execution_id and f.version = '%s'" % (
        release)
    count = cursor.execute(sql)
    if count != 0:
        for element in cursor.fetchall():
            disk_types.append(element[0])

    sql = "select distinct o.mode from filter_view f, fio o where f.id = o.testcase_execution_id and f.version = '%s'" % (
        release)
    count = cursor.execute(sql)
    if count != 0:
        for element in cursor.fetchall():
            modes.append(element[0])
    # logging.debug("Disk: %s, mode: %s" %(disk_types, modes))

    if len(disk_types) != 0 and len(modes) != 0:
        for disk in disk_types:
            if disk not in fio.keys():
                fio[disk] = {}
            for mode in modes:
                threads = '8'
                if mode == "write" or mode == "read":
                    bs = '128k'
                elif mode == "randread" or mode == "randwrite":
                    bs = "4k"
                else:
                    pass
                sql = "select o.bandwidth, o.iops from filter_view f, fio o where f.id = o.testcase_execution_id and o.block_size = '%s' and o.threads = '%s' and f.version = '%s' and \
                        f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
                bs, threads, release, board_type, cpu_type, total_threads)
                count = cursor.execute(sql)
                if count != 0:
                    bandwidth, iops = cursor.fetchone()
                    if mode == "write" or mode == "read":
                        fio[disk]["sequency_" + mode + "(MB/s)"] = [float(bandwidth)]
                    elif mode == "randread" or mode == "randwrite":
                        fio[disk][mode + "(kIOPS)"] = [float(iops)]
                    else:
                        pass
    return fio


def get_data(release, board_type, cpu_type, total_threads, cursor):
    data = {}
    spec_cpu = get_spec_cpu(release, board_type, cpu_type, total_threads, cursor)
    if len(spec_cpu) != 0:
        data['speccpu'] = spec_cpu
    spec_jbb = get_spec_jbb(release, board_type, cpu_type, total_threads, cursor)
    if len(spec_jbb) != 0:
        data['specjbb'] = spec_jbb
    lmbench = get_lmbench(release, board_type, cpu_type, total_threads, cursor)
    if len(lmbench) != 0:
        data['lmbench'] = lmbench
    iperf = get_iperf(release, board_type, cpu_type, total_threads, cursor)
    if len(iperf) != 0:
        data['Iperf'] = iperf
    fio = get_fio(release, board_type, cpu_type, total_threads, cursor)
    if len(fio) != 0:
        data['FIO'] = fio
    print(data)
    return data


def get_hardware_conf(release, board_type, cpu_type, total_threads, cursor):
    hw_conf = {}
    sql = "select h.* from filter_view f, hardware_conf h, testcase_execution t where t.id = f.id and t.hw_config_id = h.id and \
            f.version = '%s' and f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads)
    count = cursor.execute(sql)
    if count != 0:
        (id, board_type, cpu_type, total_socket, cores_per_socket, threads_per_core, total_threads, cpu_frequency,
         cpu_max_frequency,
         cpu_min_frequency, l1_cache_size, l2_cache_size, l3_cache_size, memory_total_size, total_memory, memory_speed,
         memory_configured_clock, netcard_info, disk_info, pci_info) = cursor.fetchone()
        hw_conf['Platform'] = [board_type]
        hw_conf['CPU_Type'] = [cpu_type]
        hw_conf['Total_Socket'] = [total_socket]
        hw_conf['Cores_per_Socket'] = [cores_per_socket]
        hw_conf['Threads_per_Core'] = [threads_per_core]
        hw_conf['Total_Threads'] = [total_threads]
        hw_conf['CPU_Frequency'] = [cpu_frequency]
        hw_conf['CPU_Max_Frequency'] = [cpu_max_frequency]
        hw_conf['CPU_Min_Frequency'] = [cpu_min_frequency]
        hw_conf['L1_Cache_Size'] = [l1_cache_size]
        hw_conf['L2_Cache_Size'] = [l2_cache_size]
        hw_conf['L3_Cache_Size'] = [l3_cache_size]
        hw_conf['Memory_Total_Size'] = [memory_total_size]
        hw_conf['Total_Memory'] = [total_memory]
        hw_conf['Memory_Speed'] = [memory_speed]
        hw_conf['Memory_Configured_Clock'] = [memory_configured_clock]
        hw_conf['Netcard_Info'] = [netcard_info]
        hw_conf['Disk_Info'] = [disk_info]
        hw_conf['PCI_Info'] = [pci_info]
    return hw_conf


def get_software_conf(release, board_type, cpu_type, total_threads, cursor):
    sw_conf = {}
    sql = "select s.* from filter_view f, software_conf s, testcase_execution t where t.id = f.id and t.sw_config_id = s.id and \
            f.version = '%s' and f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads)
    count = cursor.execute(sql)
    if count != 0:
        (id, os, kernel, bios, gcc, glibc, jdk, spec_cpu, spec_jbb, lmbench, iperf, fio) = cursor.fetchone()
        sw_conf['OS'] = [os]
        sw_conf['Linux_Kernel'] = [kernel]
        sw_conf['BIOS'] = [bios]
        sw_conf['GCC'] = [gcc]
        sw_conf['GLIBC'] = [glibc]
        if jdk is None:
            jdk = 'N/A'
        sw_conf['JAVA'] = [jdk]
        if spec_cpu is None:
            spec_cpu = 'N/A'
        sw_conf['SPEC_CPU'] = [spec_cpu]
        if spec_jbb is None:
            spec_jbb = 'N/A'
        sw_conf['SPEC_JBB'] = [spec_jbb]
        if lmbench is None:
            lmbench = 'N/A'
        sw_conf['Lmbench'] = [lmbench]
        if iperf is None:
            iperf = 'N/A'
        sw_conf['Iperf'] = [iperf]
        if fio is None:
            fio = 'N/A'
        sw_conf['FIO'] = [fio]
    return sw_conf


def get_tune_conf(release, board_type, cpu_type, total_threads, cursor):
    tune_conf = {}
    sql = "select c.* from filter_view f, tune_conf c, testcase_execution t where t.id = f.id and t.tune_config_id = c.id and \
            f.version = '%s' and f.board_type = '%s'and f.cpu_type = '%s' and f.total_threads = '%s' order by f.last_update desc" % (
    release, board_type, cpu_type, total_threads)
    count = cursor.execute(sql)
    if count != 0:
        (id, cpu_avaiable_govorner, cpu_current_govorner, irq_balance_status, tuned_profile, firewall_status,
         auditd_status,
         customization) = cursor.fetchone()
        tune_conf['CPU_Avaiable_Govorner'] = [cpu_avaiable_govorner]
        tune_conf['CPU_Current_Govorner'] = [cpu_current_govorner]
        tune_conf['IRQ_Balance_Status'] = [irq_balance_status]
        tune_conf['Tuned_Profile'] = [tuned_profile]
        tune_conf['Firewall_Status'] = [firewall_status]
        tune_conf['Auditd_Status'] = [auditd_status]
        if customization is None:
            customization = 'N/A'
        tune_conf['Customization'] = [customization]
    return tune_conf


def obtain_summary(releases):
    conn = connect_database()
    cursor = conn.cursor()

    summary = {}
    for release in releases:
        sql = "select distinct board_type, cpu_type, total_threads from filter_view where version = '%s'" % (release)
        count = cursor.execute(sql)
        # logging.debug("Count: %s" %(count))
        if count != 0:
            results = cursor.fetchall()
            for board_type, cpu_type, total_threads in results:
                key = release + "_" + board_type + "_" + cpu_type + "_" + total_threads
                summary[key] = {}

                summary[key]['title'] = [key]
                summary[key]['summary_data'] = get_data(release, board_type, cpu_type, total_threads, cursor)
                summary[key]['summary_hard_config'] = get_hardware_conf(release, board_type, cpu_type, total_threads,
                                                                        cursor)
                summary[key]['summary_soft_config'] = get_software_conf(release, board_type, cpu_type, total_threads,
                                                                        cursor)
                summary[key]['summary_tune'] = get_tune_conf(release, board_type, cpu_type, total_threads, cursor)

    # logging.debug("Summary: %s" %(summary))
    cursor.close()
    conn.close()
    return summary