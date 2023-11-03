export class NumberHelper {

    static numberWithThousandCommas(n: number) {
        if (n == null) return 0;
        let x = n.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        return x;
    }

    static numberWithThousandCommasAndFractions(n: number, noOfFractions: number) {
        if (n == null) return 0;
        let x = n.toFixed(noOfFractions);
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        return x;
    }
}