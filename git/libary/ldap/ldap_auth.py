import ldap
from Performance import settings
from Performance.custom_setting import ERROR_LOGS, ACCESS_LOGS
from . import check_user


class LdapAuth:
    ldap_Server = settings.AUTH_LDAP_SERVER_URI
    ldap_Bind_Dn = settings.AUTH_LDAP_BIND_DN
    ldap_Bind_Pd = settings.AUTH_LDAP_BIND_PASSWORD
    ldap_User_Dn = settings.AUTH_LDAP_USER_SEARCH

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def auth(self):
        l = ldap.initialize(self.ldap_Server)
        l.protocol_version = ldap.VERSION3
        try:
            l.simple_bind_s(self.ldap_Bind_Dn, self.ldap_Bind_Pd)
        except ldap.SERVER_DOWN as ex:
            ERROR_LOGS.error(ex)
            return None
        except ldap.INVALID_CREDENTIALS as ex:
            ERROR_LOGS.error(ex)
            return None
        except Exception as ex:
            ERROR_LOGS.error(ex)
            return None

        try:
            ldap_result_id = l.search(self.ldap_User_Dn, ldap.SCOPE_SUBTREE,
                                      '(sAMAccountName' + '=' + self.username+')', None)
            result_type, result_data = l.result(ldap_result_id, 1)
            if not len(result_data) == 0:
                r_a, r_b = result_data[0]
                dn = r_b["distinguishedName"][0]
                user_number = r_b["description"][0]
                user_name = r_b["name"][0]
                email = r_b["mail"][0]
                department = r_b["department"][0]
            else:
                return None
        except ldap.LDAPError as e:
            ERROR_LOGS.error(e)
            return None

        dn = str(dn, encoding="utf8")
        user_number = str(user_number, encoding="utf8")
        user_name = str(user_name, encoding="utf8")
        email = str(email, encoding="utf8")
        department = str(department, encoding="utf8")

        l2 = ldap.initialize(self.ldap_Server)
        result = l2.simple_bind_s(dn, self.password)

        if result[0] == 97:
            try:
                check_user.insert_role(user_number, user_name, email, department)
                ACCESS_LOGS.info('User:' + user_name + ' Number:' + user_number + ' Login in PDP')
                # Insert_Role(user_number, user_name, email, department)
                return user_name, user_number
                # return self.username
            except Exception as e:
                ERROR_LOGS.error(e)
                return None
        else:
            return None


