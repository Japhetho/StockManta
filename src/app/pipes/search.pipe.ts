import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'tickersFilter',
  pure: false,
})
@Injectable()
export class SearchPipe implements PipeTransform {
  /**
   *
   * @param items List of items to filter
   * @param term  a string term to compare with every property of the list
   * @param excludes List of keys which will be ignored during search
   *
   */
  static filter(
    items: Array<{ [key: string]: any }>,
    term: string,
    excludes: any
  ): Array<{ [key: string]: any }> {
    const toCompare = term.toLowerCase();

    // tslint:disable-next-line:no-shadowed-variable
    function checkInside(item: any, term: string): any {
      /** This function filters tickers based on the text passed by the user in the search field */
      if (
        typeof item === 'string' &&
        item.toString().toLowerCase().includes(toCompare)
      ) {
        return true;
      }

      for (const property in item) {
        if (
          item[property] === null ||
          item[property] === undefined ||
          excludes.includes(property)
        ) {
          continue;
        }
        if (typeof item[property] === 'object') {
          if (checkInside(item[property], term)) {
            return true;
          }
        } else if (
          item[property].toString().toLowerCase().includes(toCompare)
        ) {
          return true;
        }
      }
      return false;
    }

    // tslint:disable-next-line:only-arrow-functions typedef
    return items.filter(function (item) {
      return checkInside(item, term);
    });
  }
  /**
   * @param items object from array
   * @param term term's search
   * @param excludes array of strings which will ignored during search
   */
  transform(items: any, term: string, excludes: any = []): any {
    if (!term || !items) {
      return items;
    }
    return SearchPipe.filter(items, term, excludes);
  }
}
