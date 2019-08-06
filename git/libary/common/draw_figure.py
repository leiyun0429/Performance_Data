import collections, copy
from Performance.custom_setting import ERROR_LOGS, WARNING_LOGS, ACCESS_LOGS


class AutoGenEcharts:
    x_level = collections.OrderedDict()
    figure_data_summary = collections.OrderedDict()
    figure_data_format = collections.OrderedDict()
    dict_name = ''
    rel_name = ''
    xaxis = 'xaxis'
    data = 'data'
    label_name = 'name'

    def __init__(self, figure, figure_title, figure_data_name):
        self.figure_title = figure_title
        self.figure_data_name = figure_data_name
        self.figure = figure

    def combine_figure_data(self):
        try:
            global rel_name
            global figure_data_summary
            global figure_data_format
            global dict_name
            figure_data_format = collections.OrderedDict()
            figure_data_summary = collections.OrderedDict()
            rel_name = ''
            dict_name = ''

            self.generate_missing_figure_data(self.figure)
            WARNING_LOGS.warning(' self.figure=' + str(self.figure))
            keys = list(self.figure.keys())
            for key in keys:
                string = ''
                rel_name = copy.deepcopy(self.figure[key][self.figure_title])
                WARNING_LOGS.warning(' self.figure[key][self.figure_data_name]=' + str(
                    self.figure[key][self.figure_data_name]) + ' string' + str(string))
                self.define_data(self.figure[key][self.figure_data_name], string)
                WARNING_LOGS.warning(' self.figure[key][self.figure_data_name]=' + str(self.figure[key][self.figure_data_name]) + ' string' + str(string))
                figure_data_summary[key] = copy.deepcopy(self.x_level)
                WARNING_LOGS.warning(' self.x_level=' + str(self.x_level))
                self.x_level.clear()
            WARNING_LOGS.warning(' figure_data_summary=' + str(figure_data_summary))
            self.return_format_figure_data(figure_data_summary)
            WARNING_LOGS.warning(' figure_data_summary=' + str(figure_data_summary))
            return figure_data_format
        except Exception as e:
            ERROR_LOGS.error(e)
            raise e

    def generate_missing_figure_data(self, query_result):
        keys = list(query_result.keys())
        figure_temp = copy.deepcopy(query_result[keys[0]][self.figure_data_name])
        WARNING_LOGS.warning(' query_result=' + str(query_result))
        for i in range(1, len(query_result)):
            WARNING_LOGS.warning(' figure_temp=' + str(figure_temp) + ' query_result[keys[i]][self.figure_data_name]=' + str(query_result[keys[i]][self.figure_data_name]))
            self.compare_figure_data(figure_temp, query_result[keys[i]][self.figure_data_name])
            WARNING_LOGS.warning(' figure_temp=' + str(figure_temp))

        temp = copy.deepcopy(figure_temp)

        self.insert_zero_in_dict(temp)
        WARNING_LOGS.warning(' figure_temp=' + str(figure_temp))

        for key in keys:
            self.insert_figure_miss_data(temp, query_result[key][self.figure_data_name])
        WARNING_LOGS.warning(' query_result=' + str(temp))
        return temp

    def compare_figure_data(self, figure_data, figure_data2):
        keys = list(figure_data2.keys())
        for key in keys:
            if key not in figure_data:
                figure_data.update({key: figure_data2[key]})
            if key in figure_data:
                if not isinstance(figure_data[key], collections.OrderedDict):
                    if isinstance(figure_data2[key], collections.OrderedDict):
                        WARNING_LOGS.warning('Data format Exception between two data set!')
                        WARNING_LOGS.warning('figure_data[key]' + str(figure_data[key]))
                        WARNING_LOGS.warning('figure_data2[key]' + str(figure_data2[key]))
                        exit()
                    else:
                        pass
                else:
                    if not isinstance(figure_data2[key], collections.OrderedDict):
                        WARNING_LOGS.warning('Data format Exception between two data set!')
                        WARNING_LOGS.warning('figure_data[key]' + str(figure_data[key]))
                        WARNING_LOGS.warning('figure_data2[key]' + str(figure_data2[key]))
                        exit()
                    else:
                        WARNING_LOGS.warning(' figure_data[key]=' + str(figure_data[key]) + ' figure_data2[key]=' + str(
                            figure_data2[key]))
                        self.compare_figure_data(figure_data[key], figure_data2[key])
                        WARNING_LOGS.warning(' figure_data[key]=' + str(figure_data[key]) + ' figure_data2[key]=' + str(
                            figure_data2[key]))

    def insert_figure_miss_data(self, filter_figure, figure_data, zero=[0]):
        keys = list(filter_figure.keys())
        for key in keys:
            if key in figure_data:
                if isinstance(filter_figure[key], collections.OrderedDict):
                    if isinstance(figure_data[key], collections.OrderedDict):
                        self.insert_figure_miss_data(filter_figure[key], figure_data[key])
                    else:
                        WARNING_LOGS.warning('Error in insert_figure_miss_data()')
                        exit()
                else:
                    if isinstance(figure_data[key], collections.OrderedDict):
                        WARNING_LOGS.warning('Error in insert_figure_miss_data()')
                        exit()
                    else:
                        pass
            else:
                if isinstance(filter_figure[key], collections.OrderedDict):
                    figure_data.update({key: filter_figure[key]})
                    self.insert_zero_in_dict(figure_data[key])
                else:
                    figure_data.update({key: zero})

    def insert_zero_in_dict(self, dicter):
        keys = list(dicter.keys())
        for key in keys:
            if isinstance(dicter[key], collections.OrderedDict):
                self.insert_zero_in_dict(dicter[key])
            else:
                dicter[key] = [0]

    def define_data(self, dict1, string):
        for key in dict1:
            if not isinstance(dict1[key], collections.OrderedDict):

                if string not in self.x_level:
                    self.x_level[string] = collections.OrderedDict()
                if self.xaxis not in self.x_level[string]:
                    self.x_level[string][self.xaxis] = []
                    self.x_level[string][self.xaxis].append(key)
                else:
                    self.x_level[string][self.xaxis].append(key)

                if self.data not in self.x_level[string]:
                    self.x_level[string][self.data] = collections.OrderedDict()
                    self.x_level[string][self.data][self.label_name] = rel_name
                    if self.data not in self.x_level[string][self.data]:
                        self.x_level[string][self.data][self.data] = []
                        self.x_level[string][self.data][self.data].append(dict1[key][0])
                else:
                    self.x_level[string][self.data][self.data].append(dict1[key][0])

            else:
                string += key
                WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]) + ' string=' + str(string))
                self.define_data(dict1[key], string)
                WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]) + ' string=' + str(string))
                string = string.split(key)[0]

    def return_format_figure_data(self, dict1):
        global dict_name
        keys = list(dict1.keys())
        for key in keys:
            if self.xaxis not in dict1[key]:
                WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]))
                self.return_format_figure_data(dict1[key])
                WARNING_LOGS.warning(' dict1[key]=' + str(dict1[key]))
            else:
                if key not in figure_data_format:
                    figure_data_format[key] = collections.OrderedDict()
                    figure_data_format[key][self.xaxis] = dict1[key][self.xaxis]
                    figure_data_format[key][self.data] = []
                    figure_data_format[key][self.data].append(dict1[key][self.data])
                else:
                    figure_data_format[key][self.data].append(dict1[key][self.data])