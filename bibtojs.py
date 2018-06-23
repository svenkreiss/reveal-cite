import argparse
import json
import pybtex.database.input.bibtex


def json_encoder_default(obj):
    if isinstance(obj, pybtex.database.Entry):
        return {'type': obj.type, 'fields': obj.fields, 'persons': obj.persons}
    elif isinstance(obj, (pybtex.database.FieldDict, pybtex.utils.OrderedCaseInsensitiveDict)):
        return dict(obj)
    elif isinstance(obj, pybtex.database.Person):
        return {'first': ' '.join(obj.first_names),
                'middle': ' '.join(obj.middle_names),
                'last': ' '.join(obj.last_names)}

    return obj


def read_bib(bibfile):
    return pybtex.database.input.bibtex.Parser().parse_file(bibfile)


def print_js(entries):
    print('window.publications = ' + json.dumps(entries, default=json_encoder_default, indent=2) + ';')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('bibfile')
    args = parser.parse_args()

    bib = read_bib(args.bibfile)
    print_js(bib.entries)


if __name__ == '__main__':
    main()
