import pymysql
from Performance import settings


def connect_database():
    return pymysql.connect(host=settings.PF_DATABASES['HOST'], port=settings.PF_DATABASES['PORT'], user=settings.PF_DATABASES['USER'], passwd=settings.PF_DATABASES['PASSWORD'], db=settings.PF_DATABASES['NAME'], charset=settings.PF_DATABASES['CHARSET'])


def insert_role(user_number, user_name, email, department):
    conn = connect_database()
    cursor = conn.cursor()
    sql = "select u.employee_id, u.username, u.mail_address, u.department from user u where u.employee_id = '%s'" %(user_number)
    count = cursor.execute(sql)
    if count == 0:
        sql = "insert into user(employee_id, username, mail_address, department) values(%s, %s, %s, %s)"
        try:
            cursor.execute(sql,  (user_number, user_name, email, department))
            conn.commit()
        except Exception as err:
            raise err
            conn.rollback()
    cursor.close()
    conn.close()
