import collections
from Performance.custom_setting import ERROR_LOGS, WARNING_LOGS


class AutoGenTable:
    def __init__(self, data, keys):
        self.data = data
        self.keys = keys

    count = 1

    def combine_release_data(self, standard_data_form):
        try:
            first = self.keys[0]
            result = self.data[first][standard_data_form]
            for key in self.keys:
                if key == first:
                    continue
                temp = self.data[key][standard_data_form]
                WARNING_LOGS.warning(' result=' + str(result) + ' temp=' + str(temp))
                self.dict_selected(result, temp)
                WARNING_LOGS.warning(' result=' + str(result) + ' temp=' + str(temp))
                self.count += 1
            self.count = 1
            WARNING_LOGS.warning(' standard_data_form=' + str(self.data[first][standard_data_form]))
            return self.data[first][standard_data_form]
        except Exception as e:
            ERROR_LOGS.error(e)
            raise e

    def dict_selected(self, dict1={}, dict2={}):
        keys = list(set(list(dict1.keys()) + list(dict2.keys())))
        for key in keys:
            if key in dict1:
                if key in dict2:
                    if not isinstance(dict1[key], collections.OrderedDict):
                        dict1[key].append(dict2[key][0])
                    else:
                        WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]) + ' dict2[key]=' + str(
                            dict2[key]))
                        self.dict_selected(dict1[key], dict2[key])
                        WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]) + ' dict2[key]=' + str(
                            dict2[key]))
                else:
                    WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]))
                    self.dict_add_na_behind(dict1[key])
                    WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]))
            else:
                if key in dict2:
                    temp = dict2[key]
                    WARNING_LOGS.warning(' dict1[key]=' + str(dict2[key]))
                    value = self.dict_add_na_before(temp)
                    WARNING_LOGS.warning(' dict1[key]=' + str(dict2[key]))
                    dict1.update({key: value})

    def dict_add_na_behind(self, my_dict):
        if not isinstance(my_dict, collections.OrderedDict):
            my_dict.append('N/A')
        else:
            for key in my_dict:
                self.dict_add_na_behind(my_dict[key])

    def dict_add_na_before(self, my_dict):
        self.get_dict(my_dict)
        return my_dict

    def get_dict(self, my_dict):
        if not isinstance(my_dict, collections.OrderedDict):
            for i in range(0, self.count):
                my_dict.insert(0, 'N/A')
        else:
            for key in my_dict:
                WARNING_LOGS.warning(' my_dict[key]=' + str(my_dict[key]))
                self.get_dict(my_dict[key])
                WARNING_LOGS.warning(' my_dict[key]=' + str(my_dict[key]))

    ####Obtain config
    def combine_release_soft_config(self, standard_soft_config):
        try:
            first = self.keys[0]
            result = self.data[first][standard_soft_config]
            for key in self.keys:
                if key == first:
                    continue
                temp = self.data[key][standard_soft_config]
                WARNING_LOGS.warning(' result=' + str(result) + ' standard_hard_config=' + str(temp))
                self.obtain_config(result, temp)
                WARNING_LOGS.warning(' result=' + str(result) + ' standard_hard_config=' + str(temp))
                self.count += 1
            self.count = 1
            WARNING_LOGS.warning(' standard_soft_config=' + str(self.data[first][standard_soft_config]))
            return self.data[first][standard_soft_config]
        except Exception as e:
            ERROR_LOGS.error(e)
            raise e

    ####Obtain hard config
    def combine_release_hard_config(self, standard_hard_config):
        try:
            first = self.keys[0]
            result = self.data[first][standard_hard_config]
            for key in self.keys:
                if key == first:
                    continue
                temp = self.data[key][standard_hard_config]
                WARNING_LOGS.warning(' result=' + str(result) + ' standard_hard_config=' + str(temp))
                self.obtain_config(result, temp)
                WARNING_LOGS.warning(' result=' + str(result) + ' standard_hard_config=' + str(temp))
                self.count += 1
            self.count = 1
            return self.data[first][standard_hard_config]
        except Exception as e:
            ERROR_LOGS.error(e)
            raise e

    def combine_release_tune(self, standard_tune):
        try:
            first = self.keys[0]
            result = self.data[first][standard_tune]
            for key in self.keys:
                if key == first:
                    continue
                temp = self.data[key][standard_tune]
                WARNING_LOGS.warning(' result=' + str(result) + ' standard_hard_config=' + str(temp))
                self.obtain_config(result, temp)
                WARNING_LOGS.warning(' result=' + str(result) + ' standard_hard_config=' + str(temp))
                self.count += 1
            self.count = 1
            return self.data[first][standard_tune]
        except Exception as e:
            ERROR_LOGS.error(e)
            raise e

    def obtain_config(self, dict1, dict2):
        keys = list(set(list(dict1.keys()) + list(dict2.keys())))
        for key in keys:
            if key in dict1:
                if key in dict2:
                    dict1[key].append(dict2[key][0])
                else:
                    dict1[key].append('N/A')
            else:
                if key in dict2:
                    for i in range(0, self.count):
                        value = dict2[key].insert(0, 'N/A')
                    dict1.update({key: value})