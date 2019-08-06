import re
import pymysql
import logging
import string
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


def get_testcases_relation(testcase_type):

    logging.info("Connect to database")
    conn = connect_database()
    cursor = conn.cursor()

    ordered_testcases_dict = collections.OrderedDict()
    ordered_testcases_dict[testcase_type] = collections.OrderedDict()

    sql = "select id, testcase_name from testcase where parent_id is NULL and testcase_type = '%s'" % (testcase_type)
    count = cursor.execute(sql)
    if count != 0:
        results = cursor.fetchall()
        for id, parent_testcase in results:
            if re.match(r"speccpu", parent_testcase, flags = re.IGNORECASE):
                parent_testcase = "SPECCPU"
            elif re.match(r"specjbb", parent_testcase, flags = re.IGNORECASE):
                parent_testcase = "SPECjbb"
            elif re.match(r"lmbench", parent_testcase, flags=re.IGNORECASE):
                parent_testcase = "LMbench"
            elif re.match(r"iperf", parent_testcase, flags=re.IGNORECASE):
                parent_testcase = "iPerf"
            elif re.match(r"fio", parent_testcase, flags=re.IGNORECASE):
                parent_testcase = "FIO"
            else:
                pass

            ordered_testcases_dict[testcase_type][parent_testcase] = []

            sql = "select testcase_name from testcase where parent_id = %s" % (id)
            count = cursor.execute(sql)
            if count != 0:
                child_testcases = cursor.fetchall()
                for element in child_testcases:
                    child_testcase = element[0]
                    if re.match(r"lmbench-stream", child_testcase, flags = re.IGNORECASE):
                        child_testcase = "LMbench-stream"
                    if re.match(r"lmbench-latency", child_testcase, flags = re.IGNORECASE):
                        child_testcase = "LMbench-latency"
                    ordered_testcases_dict[testcase_type][parent_testcase].append(child_testcase)
    else:
        raise Exception("Release version table is empty")

    logging.info("Disconnect to database")
    cursor.close()
    conn.close()

    return ordered_testcases_dict


if __name__ == "__main__":
    logger = logging_conf(level=logging.DEBUG)
    try:
        testcase_names = get_testcases_relation('standard')
        logging.debug("Testcase Names: %s" % (testcase_names))
    except Exception as err:
        logging.debug(str(err), exc_info=True)