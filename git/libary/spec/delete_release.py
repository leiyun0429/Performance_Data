import pymysql
import logging
from Performance import settings


def logging_conf(level = None):
    if not level:
        level = logging.INFO
    
    logger = logging.getLogger()
    logger.setLevel(level = level)
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
    # return pymysql.connect(host='127.0.0.1', port=3306, user='root', passwd='root', db='hxt')


def delete_all_data(execution_ids):
    
    if len(execution_ids) == 0:
        raise Exception("The data is not selected.")

    conn = connect_database()
    cursor = conn.cursor()
    
    try:
        if len(execution_ids) == 1:
            sql = "select hw_config_id, sw_config_id, tune_config_id from testcase_execution where id = %s" % execution_ids[0]
        else:
            sql = "select hw_config_id, sw_config_id, tune_config_id from testcase_execution where id in %s" % str(tuple(execution_ids))
        # logging.debug("Query SQL: %s" % sql)
        count = cursor.execute(sql)
    except Exception as err:
        raise err
    else:
        if count == 0:
            raise Exception("No data is matched from the database.")
        else:
            results = cursor.fetchall()

            # logging.debug("Results: %s" % str(results))

            hardware_ids = []
            software_ids = []
            tune_ids = []

            for hw_config_id, sw_config_id, tune_config_id in results:
                hardware_ids.append(hw_config_id)
                software_ids.append(sw_config_id)
                tune_ids.append(tune_config_id)
            
            # logging.debug("Hardware IDS: %s" % hardware_ids)
            # logging.debug("Software IDS: %s" % software_ids)
            # logging.debug("Tune IDS: %s" % tune_ids)

            try:
                if len(execution_ids) == 1:
                    sql = "delete from testcase_execution where id = %s" % execution_ids[0]
                else:
                    sql = "delete from testcase_execution where id in %s" % str(tuple(execution_ids))
                # logging.debug("Delete SQL: %s" % sql)
                cursor.execute(sql)

                if len(hardware_ids) == 1:
                    sql = "delete from hardware_conf where id = %s" % hardware_ids[0]
                else:
                    sql = "delete from hardware_conf where id in %s" % str(tuple(hardware_ids))
                # logging.debug("Delete SQL: %s" % sql)
                cursor.execute(sql)

                if len(software_ids) == 1:
                    sql = "delete from software_conf where id = %s" % software_ids[0]
                else:
                    sql = "delete from software_conf where id in %s" % str(tuple(software_ids))
                # logging.debug("Delete SQL: %s" % sql)
                cursor.execute(sql)

                if len(tune_ids) == 1:
                    sql = "delete from tune_conf where id = %s" % tune_ids[0]
                else:
                    sql = "delete from tune_conf where id in %s" % str(tuple(tune_ids))
                # logging.debug("Delete SQL: %s" % sql)
                cursor.execute(sql)
            except Exception as err:
                conn.rollback()
                raise err
            else:
                conn.commit()
    finally:
        cursor.close()
        conn.close()


def delete_by_release(execution_ids):
    try:
        delete_all_data(execution_ids)
    except Exception as err:
        return {"flag": str(err)}
    else:
        return {"flag": "Data deleted successfully"}



