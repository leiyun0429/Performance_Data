import logging
import pymysql
from Performance import settings
from Performance.custom_setting import ACCESS_LOGS


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


class Comment:

    @staticmethod
    def update_comment(data):
        conn = connect_database()
        cursor = conn.cursor()
        try:
            sql = "update comment set content = '%s' where id = %s" % (data['content'], data['comment_id'])
            cursor.execute(sql)
        except Exception as err:
            conn.rollback()
            raise err
        else:
            conn.commit()
            ACCESS_LOGS.info("The Comment updated successfully.")
        finally:
            cursor.close()
            conn.close()
            return {'message': "The Comment updated successfully."}

    @staticmethod
    def delete_comment(comment_id):
        conn = connect_database()
        cursor = conn.cursor()

        sql = "delete from comment where id = %s" % comment_id
        try:
            cursor.execute(sql)
        except Exception as err:
            conn.rollback()
            raise err
        else:
            conn.commit()
            ACCESS_LOGS.info("The Comment deleted successfully.")
        finally:
            cursor.close()
            conn.close()
            return {'message': "The Comment deleted successfully"}

    @staticmethod
    def insert_comment(data):
        conn = connect_database()
        cursor = conn.cursor()
        try:
            sql = "select id from user where username = '%s'" % data['username']
            cursor.execute(sql)
        except Exception as err:
            raise err
        else:
            result = cursor.fetchall()
            if len(result) == 0:
                raise Exception("The user(%s) doesn't exist." % data['username'])
            elif len(result) == 1:
                sql = "insert into comment(content, from_uid, testcase_exec_id) values ('%s', %s, %s)" % (data['content'], result[0][0], data['testcase_exec_id'])
                try:
                    cursor.execute(sql)
                except Exception as err:
                    conn.rollback()
                    raise err
                else:
                    conn.commit()
                    ACCESS_LOGS.info("The comment inserted successfully")
                    return {'message': "The comment inserted successfully"}
            else:
                raise Exception("The user(%s) has multiple records." %data['username'])
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_comment(testcase_exec_ids):
        conn = connect_database()
        cursor = conn.cursor()

        comments = {}

        try:
            for testcase_exec_id in testcase_exec_ids:
                sql = "select c.id, c.content, u.username, c.comment_time from comment c, user u where c.testcase_exec_id = %s and c.from_uid = u.id order by c.id" % \
                      testcase_exec_id
                comments[str(testcase_exec_id)] = []

                cursor.execute(sql)
                results = cursor.fetchall()
                # if len(results) == 0:
                #     raise Exception("The comment data is empty.")
                # else:

                for comment_id, content, username, comment_time in results:
                    element = {}
                    element['comment_id'] = comment_id
                    element['content'] = content
                    element['username'] = username
                    element['comment_time'] = comment_time.strftime("%Y-%m-%d %H:%M:%S")

                    comments[str(testcase_exec_id)].append(element)
                ACCESS_LOGS.info("The comment obtained successfully.")
        except Exception as err:
            raise err
        finally:
            cursor.close()
            conn.close()
            return comments


if __name__ == "__main__":
    logger = logging_conf(level=logging.DEBUG)
    c = Comment()

    # data = {'username': 'Chi Xu', 'testcase_exec_id': 264, 'content': 'Testing-264'}
    # try:
    #     c.insert_comment(data)
    # except Exception as err:
    #     logging.debug(err, exc_info=True)

    # try:
    #     results = c.get_comment([253])
    # except Exception as err:
    #     logging.debug(err, exc_info=True)
    # else:
    #     logging.debug(results)

    # data = {'content': 'update', 'comment_id': 1}
    # try:
    #     c.update_comment(data)
    # except Exception as err:
    #     logging.debug(err, exc_info=True)

    # try:
    #     c.delete_comment(5)
    # except Exception as err:
    #     logging.debug(err, exc_info=True)


