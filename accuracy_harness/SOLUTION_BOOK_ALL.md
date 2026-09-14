# EasyEquate Mathematical Engine: Comprehensive Solutions Book
**Audit Mode:** Direct TypeScript Solver Engine (Live Execution)
**Total Evaluated Problems:** 1200 (75 problems per category × 16 categories)
**Passed with Symbolic Equivalence:** 1061/1200 (88.42%)
**Engine Discrepancies / Edge Case Failures:** 139

---

## Summary Category Scorecard
| Category | Problems Tested | Passed | Failed | Pass Rate | Engine Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **arithmetic_scientific** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **cubic_quartic** | 75 | 71 | 4 | 94.7% | 🟡 HIGH ACCURACY |
| **derivatives** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **edge_cases** | 75 | 25 | 50 | 33.3% | 🔴 DEFECTS |
| **exponential_logarithmic** | 75 | 54 | 21 | 72.0% | 🟡 HIGH ACCURACY |
| **inequalities** | 75 | 60 | 15 | 80.0% | 🟡 HIGH ACCURACY |
| **integrals** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **linear** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **matrix** | 75 | 65 | 10 | 86.7% | 🟡 HIGH ACCURACY |
| **ode** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **quadratic** | 75 | 57 | 18 | 76.0% | 🟡 HIGH ACCURACY |
| **radical** | 75 | 54 | 21 | 72.0% | 🟡 HIGH ACCURACY |
| **rational** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **systems_linear** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **systems_nonlinear** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |
| **trigonometric** | 75 | 75 | 0 | 100.0% | 🟢 100% PERFECT |

---

## Complete Problem-by-Problem Generated Solutions Catalog

### ARITHMETIC_SCIENTIFIC (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `arith_gcd_001` | `gcd` | `1` | `1` | 1795.7ms | ✅ PASS |
| `arith_lcm_002` | `lcm` | `3255` | `3255` | 1850.2ms | ✅ PASS |
| `arith_gcd_003` | `gcd` | `2` | `2` | 1853.7ms | ✅ PASS |
| `arith_lcm_004` | `lcm` | `7100` | `7100` | 1815.8ms | ✅ PASS |
| `arith_gcd_005` | `gcd` | `3` | `3` | 1857.7ms | ✅ PASS |
| `arith_lcm_006` | `lcm` | `8784` | `8784` | 1873.7ms | ✅ PASS |
| `arith_gcd_007` | `gcd` | `4` | `4` | 1808.0ms | ✅ PASS |
| `arith_lcm_008` | `lcm` | `13284` | `13284` | 1846.7ms | ✅ PASS |
| `arith_gcd_009` | `gcd` | `1` | `1` | 1816.8ms | ✅ PASS |
| `arith_lcm_010` | `lcm` | `399` | `399` | 1790.9ms | ✅ PASS |
| `arith_gcd_011` | `gcd` | `2` | `2` | 1871.1ms | ✅ PASS |
| `arith_lcm_012` | `lcm` | `2346` | `2346` | 1940.6ms | ✅ PASS |
| `arith_gcd_013` | `gcd` | `9` | `9` | 1804.5ms | ✅ PASS |
| `arith_lcm_014` | `lcm` | `2641` | `2641` | 1852.9ms | ✅ PASS |
| `arith_gcd_015` | `gcd` | `3` | `3` | 1810.8ms | ✅ PASS |
| `arith_lcm_016` | `lcm` | `4746` | `4746` | 1827.1ms | ✅ PASS |
| `arith_gcd_017` | `gcd` | `4` | `4` | 1960.0ms | ✅ PASS |
| `arith_lcm_018` | `lcm` | `2970` | `2970` | 1994.2ms | ✅ PASS |
| `arith_gcd_019` | `gcd` | `1` | `1` | 2000.8ms | ✅ PASS |
| `arith_lcm_020` | `lcm` | `10332` | `10332` | 2136.9ms | ✅ PASS |
| `arith_gcd_021` | `gcd` | `1` | `1` | 1894.0ms | ✅ PASS |
| `arith_lcm_022` | `lcm` | `10147` | `10147` | 1890.0ms | ✅ PASS |
| `arith_gcd_023` | `gcd` | `1` | `1` | 1989.5ms | ✅ PASS |
| `arith_lcm_024` | `lcm` | `3360` | `3360` | 1900.8ms | ✅ PASS |
| `arith_gcd_025` | `gcd` | `1` | `1` | 2089.9ms | ✅ PASS |
| `arith_lcm_026` | `lcm` | `3294` | `3294` | 2020.0ms | ✅ PASS |
| `arith_gcd_027` | `gcd` | `2` | `2` | 1958.2ms | ✅ PASS |
| `arith_lcm_028` | `lcm` | `660` | `660` | 2024.8ms | ✅ PASS |
| `arith_gcd_029` | `gcd` | `1` | `1` | 2152.6ms | ✅ PASS |
| `arith_lcm_030` | `lcm` | `18921` | `18921` | 2020.2ms | ✅ PASS |
| `unit_conv_001` | `` | `0.1` | `0.1` | 2067.8ms | ✅ PASS |
| `unit_conv_002` | `` | `5000` | `5000` | 2047.3ms | ✅ PASS |
| `unit_conv_003` | `` | `10000` | `10000` | 1992.7ms | ✅ PASS |
| `unit_conv_004` | `` | `1` | `1` | 1954.4ms | ✅ PASS |
| `unit_conv_005` | `` | `3600` | `3600` | 1975.5ms | ✅ PASS |
| `unit_conv_006` | `` | `120` | `120` | 1857.3ms | ✅ PASS |
| `unit_conv_007` | `` | `1` | `1` | 1883.4ms | ✅ PASS |
| `unit_conv_008` | `` | `300` | `300` | 1897.9ms | ✅ PASS |
| `unit_conv_009` | `` | `1` | `1` | 1961.7ms | ✅ PASS |
| `unit_conv_010` | `` | `168` | `168` | 1918.6ms | ✅ PASS |
| `unit_conv_011` | `` | `0.1` | `0.1` | 2051.8ms | ✅ PASS |
| `unit_conv_012` | `` | `5000` | `5000` | 1950.0ms | ✅ PASS |
| `unit_conv_013` | `` | `10000` | `10000` | 1917.3ms | ✅ PASS |
| `unit_conv_014` | `` | `1` | `1` | 1944.0ms | ✅ PASS |
| `unit_conv_015` | `` | `3600` | `3600` | 1897.7ms | ✅ PASS |
| `unit_conv_016` | `` | `120` | `120` | 1895.1ms | ✅ PASS |
| `unit_conv_017` | `` | `1` | `1` | 1920.0ms | ✅ PASS |
| `unit_conv_018` | `` | `300` | `300` | 1950.5ms | ✅ PASS |
| `unit_conv_019` | `` | `1` | `1` | 2034.1ms | ✅ PASS |
| `unit_conv_020` | `` | `168` | `168` | 1929.4ms | ✅ PASS |
| `unit_conv_021` | `` | `0.1` | `0.1` | 1917.3ms | ✅ PASS |
| `unit_conv_022` | `` | `5000` | `5000` | 1886.9ms | ✅ PASS |
| `unit_conv_023` | `` | `10000` | `10000` | 1937.6ms | ✅ PASS |
| `unit_conv_024` | `` | `1` | `1` | 1905.7ms | ✅ PASS |
| `unit_conv_025` | `` | `3600` | `3600` | 1884.8ms | ✅ PASS |
| `calc_eval_001` | `12 + 15 * 3` | `57` | `57` | 1943.7ms | ✅ PASS |
| `calc_eval_002` | `(24 - 8) / 4` | `4` | `4` | 1968.8ms | ✅ PASS |
| `calc_eval_003` | `2^5 + 3^2` | `41` | `41` | 1924.3ms | ✅ PASS |
| `calc_eval_004` | `sqrt(144) + sqrt(25)` | `17` | `17` | 1824.0ms | ✅ PASS |
| `calc_eval_005` | `3 * (4 + 5) - 10` | `17` | `17` | 1943.5ms | ✅ PASS |
| `calc_eval_006` | `100 / (2 + 3) * 4` | `80` | `80` | 1893.9ms | ✅ PASS |
| `calc_eval_007` | `5! + 10` | `130` | `130` | 2014.4ms | ✅ PASS |
| `calc_eval_008` | `2^3 * 3^2` | `72` | `72` | 1957.2ms | ✅ PASS |
| `calc_eval_009` | `45 - 3 * (8 + 2)` | `15` | `15` | 1945.5ms | ✅ PASS |
| `calc_eval_010` | `sqrt(64) * 5` | `40` | `40` | 1943.2ms | ✅ PASS |
| `calc_eval_011` | `15 + 25 / 5 - 2` | `18` | `18` | 1958.1ms | ✅ PASS |
| `calc_eval_012` | `3^4 - 2^5` | `49` | `49` | 1961.1ms | ✅ PASS |
| `calc_eval_013` | `(10 + 20 + 30) / 3` | `20` | `20` | 1966.0ms | ✅ PASS |
| `calc_eval_014` | `50 - 4 * 6 + 2` | `28` | `28` | 1919.6ms | ✅ PASS |
| `calc_eval_015` | `2 * (3 + 4 * (5 - 2))` | `30` | `30` | 1920.6ms | ✅ PASS |
| `calc_eval_016` | `sqrt(81) + 2^4` | `25` | `25` | 1985.3ms | ✅ PASS |
| `calc_eval_017` | `100 - 5^2 * 3` | `25` | `25` | 1970.7ms | ✅ PASS |
| `calc_eval_018` | `6 * 7 - 8 * 4` | `10` | `10` | 1917.4ms | ✅ PASS |
| `calc_eval_019` | `(15 - 5) * (12 / 3)` | `40` | `40` | 1952.7ms | ✅ PASS |
| `calc_eval_020` | `4^3 - 3^3` | `37` | `37` | 1934.3ms | ✅ PASS |


### CUBIC_QUARTIC (71/75 Passed - 94.7%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `cubic_001` | `x^3 + 1x^2 - 16x - 16 = 0` | `x = -4, \; -1, \; 4` | `x = -4, \; -1, \; 4` | 2412.4ms | ✅ PASS |
| `cubic_002` | `x^3 - 1x^2 - 4x + 4 = 0` | `x = -2, \; 1, \; 2` | `x = -2, \; 1, \; 2` | 2352.7ms | ✅ PASS |
| `cubic_003` | `x^3 - 3x^2 - 4x + 0 = 0` | `x = -1, \; 0, \; 4` | `x = -1, \; 0, \; 4` | 2379.0ms | ✅ PASS |
| `cubic_004` | `x^3 - 1x^2 - 1x + 1 = 0` | `x = -1, \; 1` | `x = -1, \; 1` | 2410.0ms | ✅ PASS |
| `cubic_005` | `x^3 - 7x^2 + 15x - 9 = 0` | `x = 1, \; 3` | `x = 1, \; 3` | 2188.2ms | ✅ PASS |
| `cubic_006` | `x^3 - 7x^2 + 12x + 0 = 0` | `x = 0, \; 3, \; 4` | `x = 0, \; 3, \; 4` | 2057.9ms | ✅ PASS |
| `cubic_007` | `x^3 + 1x^2 - 4x - 4 = 0` | `x = -2, \; -1, \; 2` | `x = -2, \; -1, \; 2` | 2118.0ms | ✅ PASS |
| `cubic_008` | `x^3 + 3x^2 - 10x - 24 = 0` | `x = -4, \; -2, \; 3` | `x = -4, \; -2, \; 3` | 2126.0ms | ✅ PASS |
| `cubic_009` | `x^3 - 7x^2 + 14x - 8 = 0` | `x = 1, \; 2, \; 4` | `x = 1, \; 2, \; 4` | 13086.8ms | ✅ PASS |
| `cubic_010` | `x^3 + 9x^2 + 26x + 24 = 0` | `x = -4, \; -3, \; -2` | `x = -4, \; -3, \; -2` | 1657.6ms | ✅ PASS |
| `cubic_011` | `x^3 - 5x^2 + 4x + 0 = 0` | `x = 0, \; 1, \; 4` | `x = 0, \; 1, \; 4` | 1743.9ms | ✅ PASS |
| `cubic_012` | `x^3 + 5x^2 + 6x + 0 = 0` | `x = -3, \; -2, \; 0` | `[-3, -2, 0]` | 5339721.4ms | ❌ FAIL |
| `cubic_013` | `x^3 + 1x^2 - 16x - 16 = 0` | `x = -4, \; -1, \; 4` | `x = -4, \; -1, \; 4` | 1686.2ms | ✅ PASS |
| `cubic_014` | `x^3 + 2x^2 - 8x + 0 = 0` | `x = -4, \; 0, \; 2` | `x = -4, \; 0, \; 2` | 1421.1ms | ✅ PASS |
| `cubic_015` | `x^3 - 10x^2 + 32x - 32 = 0` | `x = 2, \; 4` | `x = 2, \; 4` | 1042.3ms | ✅ PASS |
| `cubic_016` | `x^3 + 1x^2 - 14x - 24 = 0` | `x = -3, \; -2, \; 4` | `x = -3, \; -2, \; 4` | 1808.0ms | ✅ PASS |
| `cubic_017` | `x^3 + 3x^2 - 4x - 12 = 0` | `x = -3, \; -2, \; 2` | `x = -3, \; -2, \; 2` | 1775.8ms | ✅ PASS |
| `cubic_018` | `x^3 - 5x^2 + 4x + 0 = 0` | `x = 0, \; 1, \; 4` | `x = 0, \; 1, \; 4` | 1034.3ms | ✅ PASS |
| `cubic_019` | `x^3 + 5x^2 + 4x + 0 = 0` | `x = -4, \; -1, \; 0` | `x = -4, \; -1, \; 0` | 1666.1ms | ✅ PASS |
| `cubic_020` | `x^3 + 2x^2 + 0x + 0 = 0` | `x = -2, \; 0` | `N/A` | 0.0ms | ❌ FAIL |
| `cubic_021` | `x^3 - 5x^2 + 4x + 0 = 0` | `x = 0, \; 1, \; 4` | `x = 0, \; 1, \; 4` | 2007.3ms | ✅ PASS |
| `cubic_022` | `x^3 + 1x^2 - 4x - 4 = 0` | `x = -2, \; -1, \; 2` | `x = -2, \; -1, \; 2` | 2037.6ms | ✅ PASS |
| `cubic_023` | `x^3 - 1x^2 - 14x + 24 = 0` | `x = -4, \; 2, \; 3` | `x = -4, \; 2, \; 3` | 2084.8ms | ✅ PASS |
| `cubic_024` | `x^3 - 3x^2 - 6x + 8 = 0` | `x = -2, \; 1, \; 4` | `x = -2, \; 1, \; 4` | 2092.7ms | ✅ PASS |
| `cubic_025` | `x^3 + 2x^2 - 16x - 32 = 0` | `x = -4, \; -2, \; 4` | `x = -4, \; -2, \; 4` | 2085.3ms | ✅ PASS |
| `cubic_026` | `x^3 - 3x^2 - 6x + 8 = 0` | `x = -2, \; 1, \; 4` | `x = -2, \; 1, \; 4` | 1980.7ms | ✅ PASS |
| `cubic_027` | `x^3 + 9x^2 + 26x + 24 = 0` | `x = -4, \; -3, \; -2` | `x = -4, \; -3, \; -2` | 2060.5ms | ✅ PASS |
| `cubic_028` | `x^3 - 1x^2 - 16x + 16 = 0` | `x = -4, \; 1, \; 4` | `x = -4, \; 1, \; 4` | 2002.3ms | ✅ PASS |
| `cubic_029` | `x^3 + 2x^2 - 3x + 0 = 0` | `x = -3, \; 0, \; 1` | `x = -3, \; 0, \; 1` | 1998.5ms | ✅ PASS |
| `cubic_030` | `x^3 - 1x^2 - 10x - 8 = 0` | `x = -2, \; -1, \; 4` | `x = -2, \; -1, \; 4` | 1930.9ms | ✅ PASS |
| `cubic_031` | `x^3 + 6x^2 + 11x + 6 = 0` | `x = -3, \; -2, \; -1` | `x = -3, \; -2, \; -1` | 2010.8ms | ✅ PASS |
| `cubic_032` | `x^3 - 1x^2 - 9x + 9 = 0` | `x = -3, \; 1, \; 3` | `x = -3, \; 1, \; 3` | 1852.9ms | ✅ PASS |
| `cubic_033` | `x^3 + 1x^2 - 6x + 0 = 0` | `x = -3, \; 0, \; 2` | `x = -3, \; 0, \; 2` | 1881.5ms | ✅ PASS |
| `cubic_034` | `x^3 + 2x^2 - 3x + 0 = 0` | `x = -3, \; 0, \; 1` | `x = -3, \; 0, \; 1` | 2046.9ms | ✅ PASS |
| `cubic_035` | `x^3 - 3x^2 - 9x + 27 = 0` | `x = -3, \; 3` | `x = -3, \; 3` | 1998.6ms | ✅ PASS |
| `cubic_036` | `x^3 - 7x^2 + 8x + 16 = 0` | `x = -1, \; 4` | `x = -1, \; 4` | 2065.3ms | ✅ PASS |
| `cubic_037` | `x^3 - 5x^2 + 7x - 3 = 0` | `x = 1, \; 3` | `x = 1, \; 3` | 2019.1ms | ✅ PASS |
| `cubic_038` | `x^3 + 9x^2 + 27x + 27 = 0` | `x = -3.000018, \; -3, \; -2.999987` | `[-3]` | 1992.3ms | ❌ FAIL |
| `cubic_039` | `x^3 - 3x^2 + 0x + 0 = 0` | `x = 0, \; 3` | `N/A` | 0.0ms | ❌ FAIL |
| `cubic_040` | `x^3 + 2x^2 - 1x - 2 = 0` | `x = -2, \; -1, \; 1` | `x = -2, \; -1, \; 1` | 2013.4ms | ✅ PASS |
| `quartic_001` | `x^4 - 25x^2 + 144 = 0` | `x = -4, \; -3, \; 3, \; 4` | `x = -4, \; -3, \; 3, \; 4` | 2027.4ms | ✅ PASS |
| `quartic_002` | `x^4 - 10x^2 + 9 = 0` | `x = -3, \; -1, \; 1, \; 3` | `x = -3, \; -1, \; 1, \; 3` | 2017.7ms | ✅ PASS |
| `quartic_003` | `x^4 - 41x^2 + 400 = 0` | `x = -5, \; -4, \; 4, \; 5` | `x = -5, \; -4, \; 4, \; 5` | 1978.9ms | ✅ PASS |
| `quartic_004` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 2023.8ms | ✅ PASS |
| `quartic_005` | `x^4 - 29x^2 + 100 = 0` | `x = -5, \; -2, \; 2, \; 5` | `x = -5, \; -2, \; 2, \; 5` | 2019.0ms | ✅ PASS |
| `quartic_006` | `x^4 - 13x^2 + 36 = 0` | `x = -3, \; -2, \; 2, \; 3` | `x = -3, \; -2, \; 2, \; 3` | 1995.0ms | ✅ PASS |
| `quartic_007` | `x^4 - 18x^2 + 81 = 0` | `x = -3, \; 3` | `x = -3, \; 3` | 2011.6ms | ✅ PASS |
| `quartic_008` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 1998.1ms | ✅ PASS |
| `quartic_009` | `x^4 - 20x^2 + 64 = 0` | `x = -4, \; -2, \; 2, \; 4` | `x = -4, \; -2, \; 2, \; 4` | 2008.2ms | ✅ PASS |
| `quartic_010` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 1988.9ms | ✅ PASS |
| `quartic_011` | `x^4 - 29x^2 + 100 = 0` | `x = -5, \; -2, \; 2, \; 5` | `x = -5, \; -2, \; 2, \; 5` | 2003.7ms | ✅ PASS |
| `quartic_012` | `x^4 - 2x^2 + 1 = 0` | `x = -1, \; 1` | `x = -1, \; 1` | 2012.6ms | ✅ PASS |
| `quartic_013` | `x^4 - 10x^2 + 9 = 0` | `x = -3, \; -1, \; 1, \; 3` | `x = -3, \; -1, \; 1, \; 3` | 2025.2ms | ✅ PASS |
| `quartic_014` | `x^4 - 2x^2 + 1 = 0` | `x = -1, \; 1` | `x = -1, \; 1` | 1991.2ms | ✅ PASS |
| `quartic_015` | `x^4 - 13x^2 + 36 = 0` | `x = -3, \; -2, \; 2, \; 3` | `x = -3, \; -2, \; 2, \; 3` | 1960.8ms | ✅ PASS |
| `quartic_016` | `x^4 - 13x^2 + 36 = 0` | `x = -3, \; -2, \; 2, \; 3` | `x = -3, \; -2, \; 2, \; 3` | 1986.7ms | ✅ PASS |
| `quartic_017` | `x^4 - 13x^2 + 36 = 0` | `x = -3, \; -2, \; 2, \; 3` | `x = -3, \; -2, \; 2, \; 3` | 2008.1ms | ✅ PASS |
| `quartic_018` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 2008.7ms | ✅ PASS |
| `quartic_019` | `x^4 - 10x^2 + 9 = 0` | `x = -3, \; -1, \; 1, \; 3` | `x = -3, \; -1, \; 1, \; 3` | 2014.8ms | ✅ PASS |
| `quartic_020` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 1964.0ms | ✅ PASS |
| `quartic_021` | `x^4 - 41x^2 + 400 = 0` | `x = -5, \; -4, \; 4, \; 5` | `x = -5, \; -4, \; 4, \; 5` | 2030.9ms | ✅ PASS |
| `quartic_022` | `x^4 - 10x^2 + 9 = 0` | `x = -3, \; -1, \; 1, \; 3` | `x = -3, \; -1, \; 1, \; 3` | 2038.8ms | ✅ PASS |
| `quartic_023` | `x^4 - 34x^2 + 225 = 0` | `x = -5, \; -3, \; 3, \; 5` | `x = -5, \; -3, \; 3, \; 5` | 1944.8ms | ✅ PASS |
| `quartic_024` | `x^4 - 10x^2 + 9 = 0` | `x = -3, \; -1, \; 1, \; 3` | `x = -3, \; -1, \; 1, \; 3` | 2086.3ms | ✅ PASS |
| `quartic_025` | `x^4 - 20x^2 + 64 = 0` | `x = -4, \; -2, \; 2, \; 4` | `x = -4, \; -2, \; 2, \; 4` | 2040.2ms | ✅ PASS |
| `quartic_026` | `x^4 - 2x^2 + 1 = 0` | `x = -1, \; 1` | `x = -1, \; 1` | 2017.7ms | ✅ PASS |
| `quartic_027` | `x^4 - 10x^2 + 9 = 0` | `x = -3, \; -1, \; 1, \; 3` | `x = -3, \; -1, \; 1, \; 3` | 2011.3ms | ✅ PASS |
| `quartic_028` | `x^4 - 10x^2 + 9 = 0` | `x = -3, \; -1, \; 1, \; 3` | `x = -3, \; -1, \; 1, \; 3` | 2097.1ms | ✅ PASS |
| `quartic_029` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 1986.2ms | ✅ PASS |
| `quartic_030` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 1992.9ms | ✅ PASS |
| `quartic_031` | `x^4 - 13x^2 + 36 = 0` | `x = -3, \; -2, \; 2, \; 3` | `x = -3, \; -2, \; 2, \; 3` | 2043.0ms | ✅ PASS |
| `quartic_032` | `x^4 - 5x^2 + 4 = 0` | `x = -2, \; -1, \; 1, \; 2` | `x = -2, \; -1, \; 1, \; 2` | 2059.2ms | ✅ PASS |
| `quartic_033` | `x^4 - 41x^2 + 400 = 0` | `x = -5, \; -4, \; 4, \; 5` | `x = -5, \; -4, \; 4, \; 5` | 1979.1ms | ✅ PASS |
| `quartic_034` | `x^4 - 2x^2 + 1 = 0` | `x = -1, \; 1` | `x = -1, \; 1` | 2043.5ms | ✅ PASS |
| `quartic_035` | `x^4 - 2x^2 + 1 = 0` | `x = -1, \; 1` | `x = -1, \; 1` | 2021.8ms | ✅ PASS |


### DERIVATIVES (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `deriv_poly_001` | `2*x^2 - 2*x + 2` | `f'(x) = 4 \cdot x-2` | `f'(x) = 4 \cdot x-2` | 1871.2ms | ✅ PASS |
| `deriv_poly_002` | `5*x^5 - 5*x + 5` | `f'(x) = 25 \cdot x^{4}-5` | `f'(x) = 25 \cdot x^{4}-5` | 1914.1ms | ✅ PASS |
| `deriv_poly_003` | `2*x^2 - 2*x + 2` | `f'(x) = 4 \cdot x-2` | `f'(x) = 4 \cdot x-2` | 1872.2ms | ✅ PASS |
| `deriv_poly_004` | `3*x^3 - 3*x + 3` | `f'(x) = 9 \cdot x^{2}-3` | `f'(x) = 9 \cdot x^{2}-3` | 1854.0ms | ✅ PASS |
| `deriv_poly_005` | `3*x^2 - 2*x + 3` | `f'(x) = 6 \cdot x-2` | `f'(x) = 6 \cdot x-2` | 1958.4ms | ✅ PASS |
| `deriv_poly_006` | `5*x^2 - 2*x + 5` | `f'(x) = 10 \cdot x-2` | `f'(x) = 10 \cdot x-2` | 2092.2ms | ✅ PASS |
| `deriv_poly_007` | `2*x^5 - 5*x + 2` | `f'(x) = 10 \cdot x^{4}-5` | `f'(x) = 10 \cdot x^{4}-5` | 2036.1ms | ✅ PASS |
| `deriv_poly_008` | `3*x^4 - 4*x + 3` | `f'(x) = 12 \cdot x^{3}-4` | `f'(x) = 12 \cdot x^{3}-4` | 1972.9ms | ✅ PASS |
| `deriv_poly_009` | `4*x^3 - 3*x + 4` | `f'(x) = 12 \cdot x^{2}-3` | `f'(x) = 12 \cdot x^{2}-3` | 2000.8ms | ✅ PASS |
| `deriv_poly_010` | `5*x^3 - 3*x + 5` | `f'(x) = 15 \cdot x^{2}-3` | `f'(x) = 15 \cdot x^{2}-3` | 2070.1ms | ✅ PASS |
| `deriv_poly_011` | `2*x^5 - 5*x + 2` | `f'(x) = 10 \cdot x^{4}-5` | `f'(x) = 10 \cdot x^{4}-5` | 2066.3ms | ✅ PASS |
| `deriv_poly_012` | `3*x^4 - 4*x + 3` | `f'(x) = 12 \cdot x^{3}-4` | `f'(x) = 12 \cdot x^{3}-4` | 2005.7ms | ✅ PASS |
| `deriv_poly_013` | `4*x^3 - 3*x + 4` | `f'(x) = 12 \cdot x^{2}-3` | `f'(x) = 12 \cdot x^{2}-3` | 1901.0ms | ✅ PASS |
| `deriv_poly_014` | `2*x^5 - 5*x + 2` | `f'(x) = 10 \cdot x^{4}-5` | `f'(x) = 10 \cdot x^{4}-5` | 1826.4ms | ✅ PASS |
| `deriv_poly_015` | `5*x^4 - 4*x + 5` | `f'(x) = 20 \cdot x^{3}-4` | `f'(x) = 20 \cdot x^{3}-4` | 1854.0ms | ✅ PASS |
| `deriv_poly_016` | `5*x^5 - 5*x + 5` | `f'(x) = 25 \cdot x^{4}-5` | `f'(x) = 25 \cdot x^{4}-5` | 1846.5ms | ✅ PASS |
| `deriv_poly_017` | `4*x^3 - 3*x + 4` | `f'(x) = 12 \cdot x^{2}-3` | `f'(x) = 12 \cdot x^{2}-3` | 1941.8ms | ✅ PASS |
| `deriv_poly_018` | `3*x^3 - 3*x + 3` | `f'(x) = 9 \cdot x^{2}-3` | `f'(x) = 9 \cdot x^{2}-3` | 1832.7ms | ✅ PASS |
| `deriv_poly_019` | `2*x^5 - 5*x + 2` | `f'(x) = 10 \cdot x^{4}-5` | `f'(x) = 10 \cdot x^{4}-5` | 1820.1ms | ✅ PASS |
| `deriv_poly_020` | `5*x^5 - 5*x + 5` | `f'(x) = 25 \cdot x^{4}-5` | `f'(x) = 25 \cdot x^{4}-5` | 1884.1ms | ✅ PASS |
| `deriv_poly_021` | `5*x^3 - 3*x + 5` | `f'(x) = 15 \cdot x^{2}-3` | `f'(x) = 15 \cdot x^{2}-3` | 2156.6ms | ✅ PASS |
| `deriv_poly_022` | `2*x^4 - 4*x + 2` | `f'(x) = 8 \cdot x^{3}-4` | `f'(x) = 8 \cdot x^{3}-4` | 1990.5ms | ✅ PASS |
| `deriv_poly_023` | `2*x^4 - 4*x + 2` | `f'(x) = 8 \cdot x^{3}-4` | `f'(x) = 8 \cdot x^{3}-4` | 2052.5ms | ✅ PASS |
| `deriv_poly_024` | `3*x^4 - 4*x + 3` | `f'(x) = 12 \cdot x^{3}-4` | `f'(x) = 12 \cdot x^{3}-4` | 2071.5ms | ✅ PASS |
| `deriv_poly_025` | `4*x^5 - 5*x + 4` | `f'(x) = 20 \cdot x^{4}-5` | `f'(x) = 20 \cdot x^{4}-5` | 1914.9ms | ✅ PASS |
| `deriv_prod_001` | `x^1 * sin(x)` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mathrm{sin}\l...` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mat...` | 1926.3ms | ✅ PASS |
| `deriv_quot_002` | `(x + 2) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 1919.5ms | ✅ PASS |
| `deriv_prod_003` | `x^3 * sin(x)` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdot x^{2}+\m...` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdo...` | 1857.8ms | ✅ PASS |
| `deriv_quot_004` | `(x + 4) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 2100.7ms | ✅ PASS |
| `deriv_prod_005` | `x^2 * sin(x)` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdot x+\mathr...` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdo...` | 1865.7ms | ✅ PASS |
| `deriv_quot_006` | `(x + 6) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 2070.8ms | ✅ PASS |
| `deriv_prod_007` | `x^1 * sin(x)` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mathrm{sin}\l...` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mat...` | 2072.1ms | ✅ PASS |
| `deriv_quot_008` | `(x + 8) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 2141.0ms | ✅ PASS |
| `deriv_prod_009` | `x^3 * sin(x)` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdot x^{2}+\m...` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdo...` | 2146.0ms | ✅ PASS |
| `deriv_quot_010` | `(x + 10) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 2114.9ms | ✅ PASS |
| `deriv_prod_011` | `x^2 * sin(x)` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdot x+\mathr...` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdo...` | 2069.7ms | ✅ PASS |
| `deriv_quot_012` | `(x + 12) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 2082.5ms | ✅ PASS |
| `deriv_prod_013` | `x^1 * sin(x)` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mathrm{sin}\l...` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mat...` | 2089.8ms | ✅ PASS |
| `deriv_quot_014` | `(x + 14) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 1972.6ms | ✅ PASS |
| `deriv_prod_015` | `x^3 * sin(x)` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdot x^{2}+\m...` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdo...` | 1994.8ms | ✅ PASS |
| `deriv_quot_016` | `(x + 16) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 1978.7ms | ✅ PASS |
| `deriv_prod_017` | `x^2 * sin(x)` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdot x+\mathr...` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdo...` | 1935.2ms | ✅ PASS |
| `deriv_quot_018` | `(x + 18) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 1941.5ms | ✅ PASS |
| `deriv_prod_019` | `x^1 * sin(x)` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mathrm{sin}\l...` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mat...` | 1947.9ms | ✅ PASS |
| `deriv_quot_020` | `(x + 20) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 1956.1ms | ✅ PASS |
| `deriv_prod_021` | `x^3 * sin(x)` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdot x^{2}+\m...` | `f'(x) = 3 \cdot \mathrm{sin}\left(x\right) \cdo...` | 1964.7ms | ✅ PASS |
| `deriv_quot_022` | `(x + 22) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 1999.8ms | ✅ PASS |
| `deriv_prod_023` | `x^2 * sin(x)` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdot x+\mathr...` | `f'(x) = 2 \cdot \mathrm{sin}\left(x\right) \cdo...` | 1943.7ms | ✅ PASS |
| `deriv_quot_024` | `(x + 24) / (x^2 + 1)` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 \cdot x \c...` | `f'(x) = \frac{1}{\left(x^{2}+1\right)}-\frac{2 ...` | 1991.2ms | ✅ PASS |
| `deriv_prod_025` | `x^1 * sin(x)` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mathrm{sin}\l...` | `f'(x) = \mathrm{cos}\left(x\right) \cdot x+\mat...` | 1869.3ms | ✅ PASS |
| `deriv_chain_001` | `tan(2*x)` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\right)^{2}` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\rig...` | 2061.5ms | ✅ PASS |
| `deriv_chain_002` | `ln(x^2 + 1)` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | 1985.7ms | ✅ PASS |
| `deriv_chain_003` | `ln(x^2 + 1)` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | 1966.0ms | ✅ PASS |
| `deriv_chain_004` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 1946.6ms | ✅ PASS |
| `deriv_chain_005` | `e^(2*x)` | `f'(x) = \frac{2 \cdot 325368125^{2 \cdot x}}{119696244^{2...` | `f'(x) = \frac{2 \cdot 325368125^{2 \cdot x}}{11...` | 1965.3ms | ✅ PASS |
| `deriv_chain_006` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 1911.8ms | ✅ PASS |
| `deriv_chain_007` | `sin(2*x)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | 1957.5ms | ✅ PASS |
| `deriv_chain_008` | `tan(2*x)` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\right)^{2}` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\rig...` | 1955.5ms | ✅ PASS |
| `deriv_chain_009` | `tan(2*x)` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\right)^{2}` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\rig...` | 1901.0ms | ✅ PASS |
| `deriv_chain_010` | `tan(2*x)` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\right)^{2}` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\rig...` | 1925.5ms | ✅ PASS |
| `deriv_chain_011` | `sin(2*x)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | 1966.5ms | ✅ PASS |
| `deriv_chain_012` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 1963.5ms | ✅ PASS |
| `deriv_chain_013` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 1985.6ms | ✅ PASS |
| `deriv_chain_014` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 2145.5ms | ✅ PASS |
| `deriv_chain_015` | `sin(2*x)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | 2011.2ms | ✅ PASS |
| `deriv_chain_016` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 2033.9ms | ✅ PASS |
| `deriv_chain_017` | `ln(x^2 + 1)` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | 1990.2ms | ✅ PASS |
| `deriv_chain_018` | `ln(x^2 + 1)` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | 1975.4ms | ✅ PASS |
| `deriv_chain_019` | `tan(2*x)` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\right)^{2}` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\rig...` | 2126.0ms | ✅ PASS |
| `deriv_chain_020` | `ln(x^2 + 1)` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | 2085.7ms | ✅ PASS |
| `deriv_chain_021` | `tan(2*x)` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\right)^{2}` | `f'(x) = 2 \cdot \mathrm{sec}\left(2 \cdot x\rig...` | 1960.1ms | ✅ PASS |
| `deriv_chain_022` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 1968.7ms | ✅ PASS |
| `deriv_chain_023` | `cos(3*x)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\right)` | `f'(x) = -3 \cdot \mathrm{sin}\left(3 \cdot x\ri...` | 1988.4ms | ✅ PASS |
| `deriv_chain_024` | `ln(x^2 + 1)` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | `f'(x) = \frac{2 \cdot x}{x^{2}+1}` | 2061.0ms | ✅ PASS |
| `deriv_chain_025` | `sin(2*x)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | `f'(x) = 2 \cdot \mathrm{cos}\left(2 \cdot x\right)` | 1942.7ms | ✅ PASS |


### EDGE_CASES (25/75 Passed - 33.3%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `edge_ident_001` | `1*x + 2 = 1*(x + 2)` | `x = 0` | `All Reals` | 1935.1ms | ❌ FAIL |
| `edge_ident_002` | `2*x + 4 = 2*(x + 2)` | `x = 0` | `All Reals` | 1912.4ms | ❌ FAIL |
| `edge_ident_003` | `3*x + 6 = 3*(x + 2)` | `x = 0` | `All Reals` | 1930.3ms | ❌ FAIL |
| `edge_ident_004` | `4*x + 8 = 4*(x + 2)` | `x = 0` | `All Reals` | 1978.9ms | ❌ FAIL |
| `edge_ident_005` | `5*x + 10 = 5*(x + 2)` | `x = 0` | `All Reals` | 1972.2ms | ❌ FAIL |
| `edge_ident_006` | `6*x + 12 = 6*(x + 2)` | `x = 0` | `All Reals` | 1983.1ms | ❌ FAIL |
| `edge_ident_007` | `7*x + 14 = 7*(x + 2)` | `x = 0` | `All Reals` | 1836.5ms | ❌ FAIL |
| `edge_ident_008` | `8*x + 16 = 8*(x + 2)` | `x = 0` | `All Reals` | 1764.8ms | ❌ FAIL |
| `edge_ident_009` | `9*x + 18 = 9*(x + 2)` | `x = 0` | `All Reals` | 1769.6ms | ❌ FAIL |
| `edge_ident_010` | `10*x + 20 = 10*(x + 2)` | `x = 0` | `All Reals` | 1751.0ms | ❌ FAIL |
| `edge_ident_011` | `11*x + 22 = 11*(x + 2)` | `x = 0` | `All Reals` | 1727.5ms | ❌ FAIL |
| `edge_ident_012` | `12*x + 24 = 12*(x + 2)` | `x = 0` | `All Reals` | 1719.9ms | ❌ FAIL |
| `edge_ident_013` | `13*x + 26 = 13*(x + 2)` | `x = 0` | `All Reals` | 1785.8ms | ❌ FAIL |
| `edge_ident_014` | `14*x + 28 = 14*(x + 2)` | `x = 0` | `All Reals` | 1739.6ms | ❌ FAIL |
| `edge_ident_015` | `15*x + 30 = 15*(x + 2)` | `x = 0` | `All Reals` | 1739.2ms | ❌ FAIL |
| `edge_ident_016` | `16*x + 32 = 16*(x + 2)` | `x = 0` | `All Reals` | 1680.8ms | ❌ FAIL |
| `edge_ident_017` | `17*x + 34 = 17*(x + 2)` | `x = 0` | `All Reals` | 1824.9ms | ❌ FAIL |
| `edge_ident_018` | `18*x + 36 = 18*(x + 2)` | `x = 0` | `All Reals` | 1713.6ms | ❌ FAIL |
| `edge_ident_019` | `19*x + 38 = 19*(x + 2)` | `x = 0` | `All Reals` | 1814.2ms | ❌ FAIL |
| `edge_ident_020` | `20*x + 40 = 20*(x + 2)` | `x = 0` | `All Reals` | 1683.5ms | ❌ FAIL |
| `edge_ident_021` | `21*x + 42 = 21*(x + 2)` | `x = 0` | `All Reals` | 1771.4ms | ❌ FAIL |
| `edge_ident_022` | `22*x + 44 = 22*(x + 2)` | `x = 0` | `All Reals` | 1782.9ms | ❌ FAIL |
| `edge_ident_023` | `23*x + 46 = 23*(x + 2)` | `x = 0` | `All Reals` | 1752.3ms | ❌ FAIL |
| `edge_ident_024` | `24*x + 48 = 24*(x + 2)` | `x = 0` | `All Reals` | 1757.0ms | ❌ FAIL |
| `edge_ident_025` | `25*x + 50 = 25*(x + 2)` | `x = 0` | `All Reals` | 1726.1ms | ❌ FAIL |
| `edge_contra_001` | `x + 1 = x + 6` | `x = 0` | `No solution` | 1792.9ms | ❌ FAIL |
| `edge_contra_002` | `x + 2 = x + 7` | `x = 0` | `No solution` | 1711.1ms | ❌ FAIL |
| `edge_contra_003` | `x + 3 = x + 8` | `x = 0` | `No solution` | 1813.3ms | ❌ FAIL |
| `edge_contra_004` | `x + 4 = x + 9` | `x = 0` | `No solution` | 1757.8ms | ❌ FAIL |
| `edge_contra_005` | `x + 5 = x + 10` | `x = 0` | `No solution` | 1810.6ms | ❌ FAIL |
| `edge_contra_006` | `x + 6 = x + 11` | `x = 0` | `No solution` | 1728.5ms | ❌ FAIL |
| `edge_contra_007` | `x + 7 = x + 12` | `x = 0` | `No solution` | 1765.0ms | ❌ FAIL |
| `edge_contra_008` | `x + 8 = x + 13` | `x = 0` | `No solution` | 1771.8ms | ❌ FAIL |
| `edge_contra_009` | `x + 9 = x + 14` | `x = 0` | `No solution` | 1825.6ms | ❌ FAIL |
| `edge_contra_010` | `x + 10 = x + 15` | `x = 0` | `No solution` | 1773.9ms | ❌ FAIL |
| `edge_contra_011` | `x + 11 = x + 16` | `x = 0` | `No solution` | 1805.1ms | ❌ FAIL |
| `edge_contra_012` | `x + 12 = x + 17` | `x = 0` | `No solution` | 1768.3ms | ❌ FAIL |
| `edge_contra_013` | `x + 13 = x + 18` | `x = 0` | `No solution` | 1762.3ms | ❌ FAIL |
| `edge_contra_014` | `x + 14 = x + 19` | `x = 0` | `No solution` | 1784.5ms | ❌ FAIL |
| `edge_contra_015` | `x + 15 = x + 20` | `x = 0` | `No solution` | 1745.5ms | ❌ FAIL |
| `edge_contra_016` | `x + 16 = x + 21` | `x = 0` | `No solution` | 1724.1ms | ❌ FAIL |
| `edge_contra_017` | `x + 17 = x + 22` | `x = 0` | `No solution` | 1752.9ms | ❌ FAIL |
| `edge_contra_018` | `x + 18 = x + 23` | `x = 0` | `No solution` | 1780.9ms | ❌ FAIL |
| `edge_contra_019` | `x + 19 = x + 24` | `x = 0` | `No solution` | 1778.1ms | ❌ FAIL |
| `edge_contra_020` | `x + 20 = x + 25` | `x = 0` | `No solution` | 1710.0ms | ❌ FAIL |
| `edge_contra_021` | `x + 21 = x + 26` | `x = 0` | `No solution` | 1806.9ms | ❌ FAIL |
| `edge_contra_022` | `x + 22 = x + 27` | `x = 0` | `No solution` | 1787.4ms | ❌ FAIL |
| `edge_contra_023` | `x + 23 = x + 28` | `x = 0` | `No solution` | 1795.2ms | ❌ FAIL |
| `edge_contra_024` | `x + 24 = x + 29` | `x = 0` | `No solution` | 1754.7ms | ❌ FAIL |
| `edge_contra_025` | `x + 25 = x + 30` | `x = 0` | `No solution` | 1764.2ms | ❌ FAIL |
| `edge_domain_001` | `1/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1733.2ms | ✅ PASS |
| `edge_domain_002` | `2/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1758.4ms | ✅ PASS |
| `edge_domain_003` | `3/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1784.4ms | ✅ PASS |
| `edge_domain_004` | `4/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1759.4ms | ✅ PASS |
| `edge_domain_005` | `5/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1805.8ms | ✅ PASS |
| `edge_domain_006` | `6/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1701.2ms | ✅ PASS |
| `edge_domain_007` | `7/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1743.5ms | ✅ PASS |
| `edge_domain_008` | `8/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1681.0ms | ✅ PASS |
| `edge_domain_009` | `9/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1720.5ms | ✅ PASS |
| `edge_domain_010` | `10/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1736.7ms | ✅ PASS |
| `edge_domain_011` | `11/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1777.8ms | ✅ PASS |
| `edge_domain_012` | `12/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1721.7ms | ✅ PASS |
| `edge_domain_013` | `13/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1767.1ms | ✅ PASS |
| `edge_domain_014` | `14/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1748.4ms | ✅ PASS |
| `edge_domain_015` | `15/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1765.7ms | ✅ PASS |
| `edge_domain_016` | `16/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1793.9ms | ✅ PASS |
| `edge_domain_017` | `17/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1728.7ms | ✅ PASS |
| `edge_domain_018` | `18/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1719.4ms | ✅ PASS |
| `edge_domain_019` | `19/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1756.5ms | ✅ PASS |
| `edge_domain_020` | `20/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1746.0ms | ✅ PASS |
| `edge_domain_021` | `21/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1750.0ms | ✅ PASS |
| `edge_domain_022` | `22/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1714.5ms | ✅ PASS |
| `edge_domain_023` | `23/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1653.3ms | ✅ PASS |
| `edge_domain_024` | `24/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1753.1ms | ✅ PASS |
| `edge_domain_025` | `25/x = 0` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1797.5ms | ✅ PASS |


### EXPONENTIAL_LOGARITHMIC (54/75 Passed - 72.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `exp_base_001` | `2^(x + 3) = 2^(2*x - 1)` | `x = \frac{-1\ln(2) - 3\ln(2)}{\ln(2) - 2\ln(2)}` | `x = \frac{-1\ln(2) - 3\ln(2)}{\ln(2) - 2\ln(2)}` | 2195.5ms | ✅ PASS |
| `exp_nat_002` | `e^(4*x) = 10` | `x = [\frac{62628351}{108796589}]` | `[log(10**(1/4)) - I*pi/2, log(10**(1/4)) + I*pi...` | 2225.0ms | ❌ FAIL |
| `log_nat_003` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 2156.1ms | ✅ PASS |
| `exp_base_004` | `3^(x + 2) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | 2160.2ms | ✅ PASS |
| `exp_nat_005` | `e^(3*x) = 2` | `x = [\frac{20931769}{90594478}]` | `[log(2**(1/3)) - 2*I*pi/3, log(2**(1/3)) + 2*I*...` | 2160.9ms | ❌ FAIL |
| `log_nat_006` | `ln(x + 2) = 2` | `x = \frac{831198016}{154238145}` | `x = \frac{831198016}{154238145}` | 2205.6ms | ✅ PASS |
| `exp_base_007` | `3^(x + 2) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | 2128.8ms | ✅ PASS |
| `exp_nat_008` | `e^(2*x) = 5` | `x = \ln(2.2361)` | `[log(5)/2 + I*pi, log(5)/2]` | 1911.0ms | ❌ FAIL |
| `log_nat_009` | `ln(x + 4) = 4` | `x = \frac{1482256968}{29294687}` | `x = \frac{1482256968}{29294687}` | 2000.9ms | ✅ PASS |
| `exp_base_010` | `5^(x + 1) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 1\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 1\ln(5)}{\ln(5) - 2\ln(5)}` | 2056.2ms | ✅ PASS |
| `exp_nat_011` | `e^(3*x) = 10` | `x = [\frac{83504468}{108796589}]` | `[log(10**(1/3)) - 2*I*pi/3, log(10**(1/3)) + 2*...` | 2027.2ms | ❌ FAIL |
| `log_nat_012` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 1919.6ms | ✅ PASS |
| `exp_base_013` | `5^(x + 3) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 3\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 3\ln(5)}{\ln(5) - 2\ln(5)}` | 2069.9ms | ✅ PASS |
| `exp_nat_014` | `e^(2*x) = 10` | `x = \ln(3.1623)` | `[log(10)/2 + I*pi, log(10)/2]` | 1925.7ms | ❌ FAIL |
| `log_nat_015` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 1904.5ms | ✅ PASS |
| `exp_base_016` | `5^(x + 3) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 3\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 3\ln(5)}{\ln(5) - 2\ln(5)}` | 1875.1ms | ✅ PASS |
| `exp_nat_017` | `e^(4*x) = 7` | `x = [\frac{93257830}{191700177}]` | `[log(7**(1/4)) - I*pi/2, log(7**(1/4)) + I*pi/2...` | 2009.2ms | ❌ FAIL |
| `log_nat_018` | `ln(x + 1) = 1` | `x = \frac{205671881}{119696244}` | `x = \frac{205671881}{119696244}` | 1908.4ms | ✅ PASS |
| `exp_base_019` | `3^(x + 4) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 4\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 4\ln(3)}{\ln(3) - 2\ln(3)}` | 2019.2ms | ✅ PASS |
| `exp_nat_020` | `e^(3*x) = 3` | `x \approx 0.366204` | `[log(3**(1/3)) - 2*I*pi/3, log(3**(1/3)) + 2*I*...` | 2022.7ms | ❌ FAIL |
| `log_nat_021` | `ln(x + 4) = 4` | `x = \frac{1482256968}{29294687}` | `x = \frac{1482256968}{29294687}` | 1861.8ms | ✅ PASS |
| `exp_base_022` | `3^(x + 1) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | 1980.6ms | ✅ PASS |
| `exp_nat_023` | `e^(2*x) = 3` | `x = \ln(1.7321)` | `[log(3)/2 + I*pi, log(3)/2]` | 2004.1ms | ❌ FAIL |
| `log_nat_024` | `ln(x + 4) = 4` | `x = \frac{1482256968}{29294687}` | `x = \frac{1482256968}{29294687}` | 1942.7ms | ✅ PASS |
| `exp_base_025` | `5^(x + 4) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | 1944.7ms | ✅ PASS |
| `exp_nat_026` | `e^(2*x) = 5` | `x = \ln(2.2361)` | `[log(5)/2 + I*pi, log(5)/2]` | 1890.4ms | ❌ FAIL |
| `log_nat_027` | `ln(x + 2) = 2` | `x = \frac{831198016}{154238145}` | `x = \frac{831198016}{154238145}` | 1849.5ms | ✅ PASS |
| `exp_base_028` | `3^(x + 1) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | 1803.6ms | ✅ PASS |
| `exp_nat_029` | `e^(1*x) = 2` | `x = \ln(2)` | `x = \ln(2)` | 1888.5ms | ✅ PASS |
| `log_nat_030` | `ln(x + 2) = 2` | `x = \frac{831198016}{154238145}` | `x = \frac{831198016}{154238145}` | 1896.4ms | ✅ PASS |
| `exp_base_031` | `3^(x + 1) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | 1862.2ms | ✅ PASS |
| `exp_nat_032` | `e^(3*x) = 10` | `x = [\frac{83504468}{108796589}]` | `[log(10**(1/3)) - 2*I*pi/3, log(10**(1/3)) + 2*...` | 1840.8ms | ❌ FAIL |
| `log_nat_033` | `ln(x + 1) = 1` | `x = \frac{205671881}{119696244}` | `x = \frac{205671881}{119696244}` | 1850.5ms | ✅ PASS |
| `exp_base_034` | `3^(x + 2) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | 3174.2ms | ✅ PASS |
| `exp_nat_035` | `e^(3*x) = 2` | `x = [\frac{20931769}{90594478}]` | `[log(2**(1/3)) - 2*I*pi/3, log(2**(1/3)) + 2*I*...` | 2254.8ms | ❌ FAIL |
| `log_nat_036` | `ln(x + 1) = 1` | `x = \frac{205671881}{119696244}` | `x = \frac{205671881}{119696244}` | 1988.8ms | ✅ PASS |
| `exp_base_037` | `3^(x + 2) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 2\ln(3)}{\ln(3) - 2\ln(3)}` | 1907.2ms | ✅ PASS |
| `exp_nat_038` | `e^(4*x) = 2` | `x = [\frac{12295127}{70952475}]` | `[log(2**(1/4)) - I*pi/2, log(2**(1/4)) + I*pi/2...` | 1900.8ms | ❌ FAIL |
| `log_nat_039` | `ln(x + 1) = 1` | `x = \frac{205671881}{119696244}` | `x = \frac{205671881}{119696244}` | 1851.4ms | ✅ PASS |
| `exp_base_040` | `2^(x + 4) = 2^(2*x - 1)` | `x = \frac{-1\ln(2) - 4\ln(2)}{\ln(2) - 2\ln(2)}` | `x = \frac{-1\ln(2) - 4\ln(2)}{\ln(2) - 2\ln(2)}` | 1842.5ms | ✅ PASS |
| `exp_nat_041` | `e^(2*x) = 2` | `x = \ln(1.4142)` | `[log(2)/2 + I*pi, log(2)/2]` | 2895.3ms | ❌ FAIL |
| `log_nat_042` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 2067.0ms | ✅ PASS |
| `exp_base_043` | `2^(x + 2) = 2^(2*x - 1)` | `x = \frac{-1\ln(2) - 2\ln(2)}{\ln(2) - 2\ln(2)}` | `x = \frac{-1\ln(2) - 2\ln(2)}{\ln(2) - 2\ln(2)}` | 1881.2ms | ✅ PASS |
| `exp_nat_044` | `e^(4*x) = 2` | `x = [\frac{12295127}{70952475}]` | `[log(2**(1/4)) - I*pi/2, log(2**(1/4)) + I*pi/2...` | 1872.5ms | ❌ FAIL |
| `log_nat_045` | `ln(x + 4) = 4` | `x = \frac{1482256968}{29294687}` | `x = \frac{1482256968}{29294687}` | 1906.7ms | ✅ PASS |
| `exp_base_046` | `2^(x + 1) = 2^(2*x - 1)` | `x = \frac{-1\ln(2) - 1\ln(2)}{\ln(2) - 2\ln(2)}` | `x = \frac{-1\ln(2) - 1\ln(2)}{\ln(2) - 2\ln(2)}` | 1973.1ms | ✅ PASS |
| `exp_nat_047` | `e^(4*x) = 5` | `x = [\frac{8062987}{20039262}]` | `[log(5**(1/4)) - I*pi/2, log(5**(1/4)) + I*pi/2...` | 2017.8ms | ❌ FAIL |
| `log_nat_048` | `ln(x + 4) = 4` | `x = \frac{1482256968}{29294687}` | `x = \frac{1482256968}{29294687}` | 1941.6ms | ✅ PASS |
| `exp_base_049` | `3^(x + 1) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | 1852.5ms | ✅ PASS |
| `exp_nat_050` | `e^(4*x) = 4` | `x = [\frac{24590254}{70952475}]` | `[log(sqrt(2)) - I*pi/2, log(sqrt(2)) + I*pi/2, ...` | 1891.3ms | ❌ FAIL |
| `log_nat_051` | `ln(x + 1) = 1` | `x = \frac{205671881}{119696244}` | `x = \frac{205671881}{119696244}` | 1847.4ms | ✅ PASS |
| `exp_base_052` | `2^(x + 4) = 2^(2*x - 1)` | `x = \frac{-1\ln(2) - 4\ln(2)}{\ln(2) - 2\ln(2)}` | `x = \frac{-1\ln(2) - 4\ln(2)}{\ln(2) - 2\ln(2)}` | 1884.6ms | ✅ PASS |
| `exp_nat_053` | `e^(4*x) = 10` | `x = [\frac{62628351}{108796589}]` | `[log(10**(1/4)) - I*pi/2, log(10**(1/4)) + I*pi...` | 1971.8ms | ❌ FAIL |
| `log_nat_054` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 2005.1ms | ✅ PASS |
| `exp_base_055` | `5^(x + 2) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 2\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 2\ln(5)}{\ln(5) - 2\ln(5)}` | 1953.5ms | ✅ PASS |
| `exp_nat_056` | `e^(1*x) = 4` | `x = \ln(4)` | `x = \ln(4)` | 1982.9ms | ✅ PASS |
| `log_nat_057` | `ln(x + 1) = 1` | `x = \frac{205671881}{119696244}` | `x = \frac{205671881}{119696244}` | 2031.6ms | ✅ PASS |
| `exp_base_058` | `2^(x + 3) = 2^(2*x - 1)` | `x = \frac{-1\ln(2) - 3\ln(2)}{\ln(2) - 2\ln(2)}` | `x = \frac{-1\ln(2) - 3\ln(2)}{\ln(2) - 2\ln(2)}` | 1988.2ms | ✅ PASS |
| `exp_nat_059` | `e^(4*x) = 2` | `x = [\frac{12295127}{70952475}]` | `[log(2**(1/4)) - I*pi/2, log(2**(1/4)) + I*pi/2...` | 2010.5ms | ❌ FAIL |
| `log_nat_060` | `ln(x + 2) = 2` | `x = \frac{831198016}{154238145}` | `x = \frac{831198016}{154238145}` | 2033.6ms | ✅ PASS |
| `exp_base_061` | `3^(x + 1) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 1\ln(3)}{\ln(3) - 2\ln(3)}` | 1911.4ms | ✅ PASS |
| `exp_nat_062` | `e^(1*x) = 7` | `x = \ln(7)` | `x = \ln(7)` | 1960.8ms | ✅ PASS |
| `log_nat_063` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 1998.4ms | ✅ PASS |
| `exp_base_064` | `3^(x + 4) = 3^(2*x - 1)` | `x = \frac{-1\ln(3) - 4\ln(3)}{\ln(3) - 2\ln(3)}` | `x = \frac{-1\ln(3) - 4\ln(3)}{\ln(3) - 2\ln(3)}` | 1940.6ms | ✅ PASS |
| `exp_nat_065` | `e^(3*x) = 3` | `x \approx 0.366204` | `[log(3**(1/3)) - 2*I*pi/3, log(3**(1/3)) + 2*I*...` | 2153.4ms | ❌ FAIL |
| `log_nat_066` | `ln(x + 2) = 2` | `x = \frac{831198016}{154238145}` | `x = \frac{831198016}{154238145}` | 1776.6ms | ✅ PASS |
| `exp_base_067` | `5^(x + 4) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | 1912.8ms | ✅ PASS |
| `exp_nat_068` | `e^(1*x) = 7` | `x = \ln(7)` | `x = \ln(7)` | 1887.8ms | ✅ PASS |
| `log_nat_069` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 2061.5ms | ✅ PASS |
| `exp_base_070` | `5^(x + 4) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | 1748.9ms | ✅ PASS |
| `exp_nat_071` | `e^(4*x) = 10` | `x = [\frac{62628351}{108796589}]` | `[log(10**(1/4)) - I*pi/2, log(10**(1/4)) + I*pi...` | 1873.5ms | ❌ FAIL |
| `log_nat_072` | `ln(x + 2) = 2` | `x = \frac{831198016}{154238145}` | `x = \frac{831198016}{154238145}` | 1893.1ms | ✅ PASS |
| `exp_base_073` | `5^(x + 4) = 5^(2*x - 1)` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | `x = \frac{-1\ln(5) - 4\ln(5)}{\ln(5) - 2\ln(5)}` | 1911.8ms | ✅ PASS |
| `exp_nat_074` | `e^(3*x) = 7` | `x = [\frac{105717967}{162984864}]` | `[log(7**(1/3)) - 2*I*pi/3, log(7**(1/3)) + 2*I*...` | 1848.4ms | ❌ FAIL |
| `log_nat_075` | `ln(x + 3) = 3` | `x = \frac{243049007}{14225424}` | `x = \frac{243049007}{14225424}` | 1969.6ms | ✅ PASS |


### INEQUALITIES (60/75 Passed - 80.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `ineq_lin_001` | `-5x + 5 <= 11` | `x >= -1.2000` | `x >= -1.2000` | 1976.9ms | ✅ PASS |
| `ineq_lin_002` | `3x - 11 <= 0` | `x <= 3.6667` | `Interval(-oo, 11/3)` | 2017.6ms | ❌ FAIL |
| `ineq_lin_003` | `-3x - 4 > 15` | `x < -6.3333` | `Interval.open(-oo, -19/3)` | 1992.8ms | ❌ FAIL |
| `ineq_lin_004` | `-4x - 3 <= -13` | `x >= 2.5000` | `x >= 2.5000` | 1934.2ms | ✅ PASS |
| `ineq_lin_005` | `5x - 10 >= 4` | `x >= 2.8000` | `x >= 2.8000` | 2682.2ms | ✅ PASS |
| `ineq_lin_006` | `-3x + 6 < 5` | `x > 0.3333` | `Interval.open(1/3, oo)` | 2326.8ms | ❌ FAIL |
| `ineq_lin_007` | `3x - 10 > 16` | `x > 8.6667` | `Interval.open(26/3, oo)` | 2422.3ms | ❌ FAIL |
| `ineq_lin_008` | `5x + 19 > -9` | `x > -5.6000` | `x > -5.6000` | 2187.2ms | ✅ PASS |
| `ineq_lin_009` | `3x - 12 < -1` | `x < 3.6667` | `Interval.open(-oo, 11/3)` | 2041.0ms | ❌ FAIL |
| `ineq_lin_010` | `5x - 11 >= -19` | `x >= -1.6000` | `x >= -1.6000` | 2086.9ms | ✅ PASS |
| `ineq_lin_011` | `-4x + 5 < -10` | `x > 3.7500` | `x > 3.7500` | 2020.4ms | ✅ PASS |
| `ineq_lin_012` | `2x - 19 >= 18` | `x >= 18.5000` | `x >= 18.5000` | 2090.5ms | ✅ PASS |
| `ineq_lin_013` | `-7x + 4 > -17` | `x < 3` | `x < 3` | 2113.1ms | ✅ PASS |
| `ineq_lin_014` | `3x + 13 <= 17` | `x <= 1.3333` | `Interval(-oo, 4/3)` | 2096.6ms | ❌ FAIL |
| `ineq_lin_015` | `-7x - 1 >= -13` | `x <= 1.7143` | `Interval(-oo, 12/7)` | 2045.8ms | ❌ FAIL |
| `ineq_lin_016` | `-5x + 9 > 14` | `x < -1` | `Interval.open(-oo, -1)` | 1887840.5ms | ❌ FAIL |
| `ineq_lin_017` | `-5x - 6 < -6` | `x > 0` | `x > 0` | 1842.9ms | ✅ PASS |
| `ineq_lin_018` | `-1x - 9 >= 4` | `x <= -13` | `x <= -13` | 24821584.8ms | ❌ FAIL |
| `ineq_lin_019` | `7x + 7 <= -8` | `x <= -2.1429` | `Interval(-oo, -15/7)` | 1009.9ms | ❌ FAIL |
| `ineq_lin_020` | `3x - 12 <= 9` | `x <= 7` | `x <= 7` | 1.0ms | ✅ PASS |
| `ineq_lin_021` | `7x - 18 < 12` | `x < 4.2857` | `x < 4.2857` | 1.0ms | ✅ PASS |
| `ineq_lin_022` | `-5x + 17 > 5` | `x < 2.4000` | `x < 2.4000` | 1.0ms | ✅ PASS |
| `ineq_lin_023` | `-4x - 14 >= -8` | `x <= -1.5000` | `x <= -1.5000` | 1122.7ms | ✅ PASS |
| `ineq_lin_024` | `1x - 17 > 9` | `x > 26` | `x > 26` | 1.0ms | ✅ PASS |
| `ineq_lin_025` | `-7x - 10 < -12` | `x > 0.2857` | `x > 0.2857` | 1.0ms | ✅ PASS |
| `ineq_lin_026` | `3x + 5 <= 17` | `x <= 4` | `x <= 4` | 1.0ms | ✅ PASS |
| `ineq_lin_027` | `4x + 1 >= -7` | `x >= -2` | `x >= -2` | 1.0ms | ✅ PASS |
| `ineq_lin_028` | `-3x - 12 >= 11` | `x <= -7.6667` | `x <= -7.6667` | 1.0ms | ✅ PASS |
| `ineq_lin_029` | `1x + 0 > 0` | `x > 0` | `x > 0` | 1.0ms | ✅ PASS |
| `ineq_lin_030` | `-5x - 8 > 3` | `x < -2.2000` | `x < -2.2000` | 1.0ms | ✅ PASS |
| `ineq_lin_031` | `-7x - 17 < 7` | `x > -3.4286` | `x > -3.4286` | 1.0ms | ✅ PASS |
| `ineq_lin_032` | `7x + 11 <= -16` | `x <= -3.8571` | `x <= -3.8571` | 1.0ms | ✅ PASS |
| `ineq_lin_033` | `-5x - 13 >= -10` | `x <= -0.6000` | `x <= -0.6000` | 1.0ms | ✅ PASS |
| `ineq_lin_034` | `-3x - 5 >= 20` | `x <= -8.3333` | `x <= -8.3333` | 1.0ms | ✅ PASS |
| `ineq_lin_035` | `-5x + 6 >= 1` | `x <= 1` | `Interval(-oo, 1)` | 786609.2ms | ❌ FAIL |
| `ineq_quad_001` | `x^2 + 1x - 30 <= 0` | `-6 \leq x \leq 5` | `-6 \leq x \leq 5` | 3406.3ms | ❌ FAIL |
| `ineq_quad_002` | `x^2 + 1x - 2 > 0` | `x < -2 \quad \text{or} \quad x > 1` | `x < -2 \quad \text{or} \quad x > 1` | 1864.0ms | ✅ PASS |
| `ineq_quad_003` | `x^2 + 1x - 12 < 0` | `-4 < x < 3` | `-4 < x < 3` | 1764.2ms | ✅ PASS |
| `ineq_quad_004` | `x^2 + 2x - 24 > 0` | `x < -6 \quad \text{or} \quad x > 4` | `x < -6 \quad \text{or} \quad x > 4` | 1706.7ms | ✅ PASS |
| `ineq_quad_005` | `x^2 + 4x - 12 > 0` | `x < -6 \quad \text{or} \quad x > 2` | `x < -6 \quad \text{or} \quad x > 2` | 1359.5ms | ✅ PASS |
| `ineq_quad_006` | `x^2 + 3x - 10 >= 0` | `x \leq -5 \quad \text{or} \quad x \geq 2` | `Union(Interval(-oo, -5), Interval(2, oo))` | 1326.7ms | ❌ FAIL |
| `ineq_quad_007` | `x^2 + 4x - 12 > 0` | `x < -6 \quad \text{or} \quad x > 2` | `x < -6 \quad \text{or} \quad x > 2` | 1422.1ms | ✅ PASS |
| `ineq_quad_008` | `x^2 - 3x - 28 < 0` | `-4 < x < 7` | `-4 < x < 7` | 1277.8ms | ✅ PASS |
| `ineq_quad_009` | `x^2 + 3x - 18 > 0` | `x < -6 \quad \text{or} \quad x > 3` | `x < -6 \quad \text{or} \quad x > 3` | 1.0ms | ✅ PASS |
| `ineq_quad_010` | `x^2 + 3x - 18 < 0` | `-6 < x < 3` | `-6 < x < 3` | 1.0ms | ✅ PASS |
| `ineq_quad_011` | `x^2 - 4x - 12 >= 0` | `x \leq -2 \quad \text{or} \quad x \geq 6` | `x \leq -2 \quad \text{or} \quad x \geq 6` | 1.0ms | ✅ PASS |
| `ineq_quad_012` | `x^2 - 1x + 0 < 0` | `0 < x < 1` | `0 < x < 1` | 1.0ms | ✅ PASS |
| `ineq_quad_013` | `x^2 + 3x - 4 > 0` | `x < -4 \quad \text{or} \quad x > 1` | `x < -4 \quad \text{or} \quad x > 1` | 1.0ms | ✅ PASS |
| `ineq_quad_014` | `x^2 - 5x + 0 < 0` | `0 < x < 5` | `0 < x < 5` | 1.0ms | ✅ PASS |
| `ineq_quad_015` | `x^2 - 2x + 0 <= 0` | `0 \leq x \leq 2` | `0 \leq x \leq 2` | 1.0ms | ✅ PASS |
| `ineq_quad_016` | `x^2 - 5x - 6 > 0` | `x < -1 \quad \text{or} \quad x > 6` | `x < -1 \quad \text{or} \quad x > 6` | 1001.9ms | ✅ PASS |
| `ineq_quad_017` | `x^2 - 2x + 0 >= 0` | `x \leq 0 \quad \text{or} \quad x \geq 2` | `x \leq 0 \quad \text{or} \quad x \geq 2` | 1.0ms | ✅ PASS |
| `ineq_quad_018` | `x^2 - 2x + 0 > 0` | `x < 0 \quad \text{or} \quad x > 2` | `x < 0 \quad \text{or} \quad x > 2` | 1010.8ms | ✅ PASS |
| `ineq_quad_019` | `x^2 - 1x - 2 < 0` | `-1 < x < 2` | `-1 < x < 2` | 1210.3ms | ✅ PASS |
| `ineq_quad_020` | `x^2 + 3x - 10 <= 0` | `-5 \leq x \leq 2` | `-5 \leq x \leq 2` | 1.0ms | ✅ PASS |
| `ineq_quad_021` | `x^2 + 1x - 20 <= 0` | `-5 \leq x \leq 4` | `-5 \leq x \leq 4` | 1.0ms | ✅ PASS |
| `ineq_quad_022` | `x^2 - 1x - 12 > 0` | `x < -3 \quad \text{or} \quad x > 4` | `x < -3 \quad \text{or} \quad x > 4` | 1.0ms | ✅ PASS |
| `ineq_quad_023` | `x^2 - 2x - 24 > 0` | `x < -4 \quad \text{or} \quad x > 6` | `x < -4 \quad \text{or} \quad x > 6` | 1.0ms | ✅ PASS |
| `ineq_quad_024` | `x^2 + 1x - 12 < 0` | `-4 < x < 3` | `-4 < x < 3` | 1.0ms | ✅ PASS |
| `ineq_quad_025` | `x^2 - 3x - 28 <= 0` | `-4 \leq x \leq 7` | `-4 \leq x \leq 7` | 1.0ms | ✅ PASS |
| `ineq_quad_026` | `x^2 - 4x - 12 >= 0` | `x \leq -2 \quad \text{or} \quad x \geq 6` | `x \leq -2 \quad \text{or} \quad x \geq 6` | 1.0ms | ✅ PASS |
| `ineq_quad_027` | `x^2 - 2x - 24 < 0` | `-4 < x < 6` | `-4 < x < 6` | 1.0ms | ✅ PASS |
| `ineq_quad_028` | `x^2 + 2x - 8 <= 0` | `-4 \leq x \leq 2` | `-4 \leq x \leq 2` | 1.0ms | ✅ PASS |
| `ineq_quad_029` | `x^2 + 0x - 9 > 0` | `x < -3 \quad \text{or} \quad x > 3` | `N/A` | 0.0ms | ❌ FAIL |
| `ineq_quad_030` | `x^2 - 5x - 6 < 0` | `-1 < x < 6` | `-1 < x < 6` | 1.0ms | ✅ PASS |
| `ineq_quad_031` | `x^2 - 5x - 14 <= 0` | `-2 \leq x \leq 7` | `-2 \leq x \leq 7` | 1.0ms | ✅ PASS |
| `ineq_quad_032` | `x^2 + 1x - 12 <= 0` | `-4 \leq x \leq 3` | `-4 \leq x \leq 3` | 1.0ms | ✅ PASS |
| `ineq_quad_033` | `x^2 - 1x - 12 > 0` | `x < -3 \quad \text{or} \quad x > 4` | `x < -3 \quad \text{or} \quad x > 4` | 1.0ms | ✅ PASS |
| `ineq_quad_034` | `x^2 - 3x - 28 <= 0` | `-4 \leq x \leq 7` | `-4 \leq x \leq 7` | 1.0ms | ✅ PASS |
| `ineq_quad_035` | `x^2 + 4x - 12 < 0` | `-6 < x < 2` | `-6 < x < 2` | 1.0ms | ✅ PASS |
| `ineq_quad_036` | `x^2 - 3x - 18 > 0` | `x < -3 \quad \text{or} \quad x > 6` | `x < -3 \quad \text{or} \quad x > 6` | 1.0ms | ✅ PASS |
| `ineq_quad_037` | `x^2 - 2x - 3 >= 0` | `x \leq -1 \quad \text{or} \quad x \geq 3` | `x \leq -1 \quad \text{or} \quad x \geq 3` | 1.0ms | ✅ PASS |
| `ineq_quad_038` | `x^2 + 3x - 18 <= 0` | `-6 \leq x \leq 3` | `-6 \leq x \leq 3` | 1.0ms | ✅ PASS |
| `ineq_quad_039` | `x^2 + 0x - 16 > 0` | `x < -4 \quad \text{or} \quad x > 4` | `N/A` | 0.0ms | ❌ FAIL |
| `ineq_quad_040` | `x^2 - 2x - 8 > 0` | `x < -2 \quad \text{or} \quad x > 4` | `x < -2 \quad \text{or} \quad x > 4` | 1.0ms | ✅ PASS |


### INTEGRALS (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `integ_indef_001` | `2*x^2` | `F(x) = \frac{2 \cdot x^{3}}{3} + C` | `F(x) = \frac{2 \cdot x^{3}}{3} + C` | 1921.8ms | ✅ PASS |
| `integ_indef_002` | `e^(2*x)` | `F(x) = \frac{325368125^{2 \cdot x}}{119696244^{2 \cdot x}...` | `F(x) = \frac{325368125^{2 \cdot x}}{119696244^{...` | 2017.7ms | ✅ PASS |
| `integ_indef_003` | `1*x^3` | `F(x) = \frac{x^{4}}{4} + C` | `F(x) = \frac{x^{4}}{4} + C` | 1965.8ms | ✅ PASS |
| `integ_indef_004` | `sin(2*x)` | `F(x) = -\frac{\mathrm{cos}\left(2 \cdot x\right)}{2} + C` | `F(x) = -\frac{\mathrm{cos}\left(2 \cdot x\right...` | 2026.0ms | ✅ PASS |
| `integ_indef_005` | `5*x^2` | `F(x) = \frac{5 \cdot x^{3}}{3} + C` | `F(x) = \frac{5 \cdot x^{3}}{3} + C` | 1989.8ms | ✅ PASS |
| `integ_indef_006` | `sin(4*x)` | `F(x) = -\frac{\mathrm{cos}\left(4 \cdot x\right)}{4} + C` | `F(x) = -\frac{\mathrm{cos}\left(4 \cdot x\right...` | 1897.5ms | ✅ PASS |
| `integ_indef_007` | `cos(3*x)` | `F(x) = \frac{\mathrm{sin}\left(3 \cdot x\right)}{3} + C` | `F(x) = \frac{\mathrm{sin}\left(3 \cdot x\right)...` | 2040.0ms | ✅ PASS |
| `integ_indef_008` | `e^(4*x)` | `F(x) = \frac{325368125^{4 \cdot x}}{119696244^{4 \cdot x}...` | `F(x) = \frac{325368125^{4 \cdot x}}{119696244^{...` | 2115.8ms | ✅ PASS |
| `integ_indef_009` | `e^(1*x)` | `F(x) = \frac{325368125^{x}}{119696244^{x} \cdot \left(\ma...` | `F(x) = \frac{325368125^{x}}{119696244^{x} \cdot...` | 1914.4ms | ✅ PASS |
| `integ_indef_010` | `cos(2*x)` | `F(x) = \frac{\mathrm{sin}\left(2 \cdot x\right)}{2} + C` | `F(x) = \frac{\mathrm{sin}\left(2 \cdot x\right)...` | 2059.8ms | ✅ PASS |
| `integ_indef_011` | `2*x^4` | `F(x) = \frac{2 \cdot x^{5}}{5} + C` | `F(x) = \frac{2 \cdot x^{5}}{5} + C` | 2039.0ms | ✅ PASS |
| `integ_indef_012` | `cos(4*x)` | `F(x) = \frac{\mathrm{sin}\left(4 \cdot x\right)}{4} + C` | `F(x) = \frac{\mathrm{sin}\left(4 \cdot x\right)...` | 1971.6ms | ✅ PASS |
| `integ_indef_013` | `1*x^1` | `F(x) = \frac{x^{2}}{2} + C` | `F(x) = \frac{x^{2}}{2} + C` | 2005.0ms | ✅ PASS |
| `integ_indef_014` | `3/x` | `F(x) = 3 \cdot \mathrm{log}\left(x\right) + C` | `F(x) = 3 \cdot \mathrm{log}\left(x\right) + C` | 2017.2ms | ✅ PASS |
| `integ_indef_015` | `3*x^4` | `F(x) = \frac{3 \cdot x^{5}}{5} + C` | `F(x) = \frac{3 \cdot x^{5}}{5} + C` | 1989.8ms | ✅ PASS |
| `integ_indef_016` | `cos(5*x)` | `F(x) = \frac{\mathrm{sin}\left(5 \cdot x\right)}{5} + C` | `F(x) = \frac{\mathrm{sin}\left(5 \cdot x\right)...` | 2045.7ms | ✅ PASS |
| `integ_indef_017` | `cos(5*x)` | `F(x) = \frac{\mathrm{sin}\left(5 \cdot x\right)}{5} + C` | `F(x) = \frac{\mathrm{sin}\left(5 \cdot x\right)...` | 2062.7ms | ✅ PASS |
| `integ_indef_018` | `e^(1*x)` | `F(x) = \frac{325368125^{x}}{119696244^{x} \cdot \left(\ma...` | `F(x) = \frac{325368125^{x}}{119696244^{x} \cdot...` | 2038.8ms | ✅ PASS |
| `integ_indef_019` | `3*x^3` | `F(x) = \frac{3 \cdot x^{4}}{4} + C` | `F(x) = \frac{3 \cdot x^{4}}{4} + C` | 2035.3ms | ✅ PASS |
| `integ_indef_020` | `3*x^1` | `F(x) = \frac{3 \cdot x^{2}}{2} + C` | `F(x) = \frac{3 \cdot x^{2}}{2} + C` | 1994.5ms | ✅ PASS |
| `integ_indef_021` | `sin(1*x)` | `F(x) = -\mathrm{cos}\left(x\right) + C` | `F(x) = -\mathrm{cos}\left(x\right) + C` | 2009.5ms | ✅ PASS |
| `integ_indef_022` | `e^(1*x)` | `F(x) = \frac{325368125^{x}}{119696244^{x} \cdot \left(\ma...` | `F(x) = \frac{325368125^{x}}{119696244^{x} \cdot...` | 2000.5ms | ✅ PASS |
| `integ_indef_023` | `1*x^3` | `F(x) = \frac{x^{4}}{4} + C` | `F(x) = \frac{x^{4}}{4} + C` | 2009.4ms | ✅ PASS |
| `integ_indef_024` | `e^(5*x)` | `F(x) = \frac{325368125^{5 \cdot x}}{119696244^{5 \cdot x}...` | `F(x) = \frac{325368125^{5 \cdot x}}{119696244^{...` | 1958.3ms | ✅ PASS |
| `integ_indef_025` | `5/x` | `F(x) = 5 \cdot \mathrm{log}\left(x\right) + C` | `F(x) = 5 \cdot \mathrm{log}\left(x\right) + C` | 2033.9ms | ✅ PASS |
| `integ_indef_026` | `3*x^4` | `F(x) = \frac{3 \cdot x^{5}}{5} + C` | `F(x) = \frac{3 \cdot x^{5}}{5} + C` | 2005.2ms | ✅ PASS |
| `integ_indef_027` | `1*x^1` | `F(x) = \frac{x^{2}}{2} + C` | `F(x) = \frac{x^{2}}{2} + C` | 1894.7ms | ✅ PASS |
| `integ_indef_028` | `cos(1*x)` | `F(x) = \mathrm{sin}\left(x\right) + C` | `F(x) = \mathrm{sin}\left(x\right) + C` | 2053.4ms | ✅ PASS |
| `integ_indef_029` | `e^(3*x)` | `F(x) = \frac{325368125^{3 \cdot x}}{119696244^{3 \cdot x}...` | `F(x) = \frac{325368125^{3 \cdot x}}{119696244^{...` | 2017.7ms | ✅ PASS |
| `integ_indef_030` | `1*x^3` | `F(x) = \frac{x^{4}}{4} + C` | `F(x) = \frac{x^{4}}{4} + C` | 2023.5ms | ✅ PASS |
| `integ_indef_031` | `cos(3*x)` | `F(x) = \frac{\mathrm{sin}\left(3 \cdot x\right)}{3} + C` | `F(x) = \frac{\mathrm{sin}\left(3 \cdot x\right)...` | 2004.2ms | ✅ PASS |
| `integ_indef_032` | `2*x^2` | `F(x) = \frac{2 \cdot x^{3}}{3} + C` | `F(x) = \frac{2 \cdot x^{3}}{3} + C` | 2058.7ms | ✅ PASS |
| `integ_indef_033` | `cos(1*x)` | `F(x) = \mathrm{sin}\left(x\right) + C` | `F(x) = \mathrm{sin}\left(x\right) + C` | 1943.2ms | ✅ PASS |
| `integ_indef_034` | `3/x` | `F(x) = 3 \cdot \mathrm{log}\left(x\right) + C` | `F(x) = 3 \cdot \mathrm{log}\left(x\right) + C` | 2006.5ms | ✅ PASS |
| `integ_indef_035` | `2/x` | `F(x) = 2 \cdot \mathrm{log}\left(x\right) + C` | `F(x) = 2 \cdot \mathrm{log}\left(x\right) + C` | 2006.9ms | ✅ PASS |
| `integ_indef_036` | `cos(5*x)` | `F(x) = \frac{\mathrm{sin}\left(5 \cdot x\right)}{5} + C` | `F(x) = \frac{\mathrm{sin}\left(5 \cdot x\right)...` | 2042.7ms | ✅ PASS |
| `integ_indef_037` | `sin(5*x)` | `F(x) = -\frac{\mathrm{cos}\left(5 \cdot x\right)}{5} + C` | `F(x) = -\frac{\mathrm{cos}\left(5 \cdot x\right...` | 1968.6ms | ✅ PASS |
| `integ_indef_038` | `sin(1*x)` | `F(x) = -\mathrm{cos}\left(x\right) + C` | `F(x) = -\mathrm{cos}\left(x\right) + C` | 2100.6ms | ✅ PASS |
| `integ_indef_039` | `sin(2*x)` | `F(x) = -\frac{\mathrm{cos}\left(2 \cdot x\right)}{2} + C` | `F(x) = -\frac{\mathrm{cos}\left(2 \cdot x\right...` | 2022.5ms | ✅ PASS |
| `integ_indef_040` | `2/x` | `F(x) = 2 \cdot \mathrm{log}\left(x\right) + C` | `F(x) = 2 \cdot \mathrm{log}\left(x\right) + C` | 2028.5ms | ✅ PASS |
| `integ_def_001` | `x^2` | `\frac{7}{3}` | `\frac{7}{3}` | 2005.8ms | ✅ PASS |
| `integ_def_002` | `x^2` | `\frac{26}{3}` | `\frac{26}{3}` | 2047.3ms | ✅ PASS |
| `integ_def_003` | `x^1` | `4` | `4` | 1995.0ms | ✅ PASS |
| `integ_def_004` | `x^2` | `21` | `21` | 2007.6ms | ✅ PASS |
| `integ_def_005` | `x^3` | `\frac{81}{4}` | `\frac{81}{4}` | 2084.1ms | ✅ PASS |
| `integ_def_006` | `x^3` | `\frac{255}{4}` | `\frac{255}{4}` | 2091.6ms | ✅ PASS |
| `integ_def_007` | `x^3` | `64` | `64` | 2084.6ms | ✅ PASS |
| `integ_def_008` | `x^2` | `\frac{26}{3}` | `\frac{26}{3}` | 1931.0ms | ✅ PASS |
| `integ_def_009` | `x^3` | `20` | `20` | 2053.4ms | ✅ PASS |
| `integ_def_010` | `x^3` | `\frac{81}{4}` | `\frac{81}{4}` | 2059.8ms | ✅ PASS |
| `integ_def_011` | `x^1` | `4` | `4` | 2105.9ms | ✅ PASS |
| `integ_def_012` | `x^2` | `\frac{64}{3}` | `\frac{64}{3}` | 1957.0ms | ✅ PASS |
| `integ_def_013` | `x^2` | `9` | `9` | 2105.5ms | ✅ PASS |
| `integ_def_014` | `x^1` | `4` | `4` | 2047.3ms | ✅ PASS |
| `integ_def_015` | `x^1` | `\frac{9}{2}` | `\frac{9}{2}` | 1991.7ms | ✅ PASS |
| `integ_def_016` | `x^2` | `\frac{7}{3}` | `\frac{7}{3}` | 2054.1ms | ✅ PASS |
| `integ_def_017` | `x^2` | `\frac{7}{3}` | `\frac{7}{3}` | 2149.0ms | ✅ PASS |
| `integ_def_018` | `x^2` | `21` | `21` | 1956.6ms | ✅ PASS |
| `integ_def_019` | `x^3` | `64` | `64` | 2014.7ms | ✅ PASS |
| `integ_def_020` | `x^2` | `\frac{8}{3}` | `\frac{8}{3}` | 1974.5ms | ✅ PASS |
| `integ_def_021` | `x^1` | `\frac{15}{2}` | `\frac{15}{2}` | 1973.8ms | ✅ PASS |
| `integ_def_022` | `x^1` | `\frac{3}{2}` | `\frac{3}{2}` | 1944.1ms | ✅ PASS |
| `integ_def_023` | `x^3` | `\frac{81}{4}` | `\frac{81}{4}` | 1934.8ms | ✅ PASS |
| `integ_def_024` | `x^2` | `\frac{26}{3}` | `\frac{26}{3}` | 1965.4ms | ✅ PASS |
| `integ_def_025` | `x^2` | `\frac{7}{3}` | `\frac{7}{3}` | 1939.4ms | ✅ PASS |
| `integ_def_026` | `x^3` | `\frac{255}{4}` | `\frac{255}{4}` | 1991.3ms | ✅ PASS |
| `integ_def_027` | `x^3` | `64` | `64` | 1959.1ms | ✅ PASS |
| `integ_def_028` | `x^1` | `\frac{15}{2}` | `\frac{15}{2}` | 2021.2ms | ✅ PASS |
| `integ_def_029` | `x^3` | `\frac{15}{4}` | `\frac{15}{4}` | 1913.2ms | ✅ PASS |
| `integ_def_030` | `x^3` | `\frac{15}{4}` | `\frac{15}{4}` | 1932.4ms | ✅ PASS |
| `integ_def_031` | `x^1` | `\frac{3}{2}` | `\frac{3}{2}` | 2013.4ms | ✅ PASS |
| `integ_def_032` | `x^2` | `\frac{26}{3}` | `\frac{26}{3}` | 1970.7ms | ✅ PASS |
| `integ_def_033` | `x^1` | `\frac{9}{2}` | `\frac{9}{2}` | 1935.1ms | ✅ PASS |
| `integ_def_034` | `x^1` | `4` | `4` | 1874.4ms | ✅ PASS |
| `integ_def_035` | `x^3` | `\frac{15}{4}` | `\frac{15}{4}` | 1956.5ms | ✅ PASS |


### LINEAR (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `lin_001` | `-6x - 10 = 2` | `x = -2` | `x = -2` | 2220.1ms | ✅ PASS |
| `lin_002` | `8x + 11 = -6x + 25` | `x = 1` | `x = 1` | 1987.0ms | ✅ PASS |
| `lin_003` | `-2*(x + 27) = 8` | `x = -31` | `x = -31` | 1883.6ms | ✅ PASS |
| `lin_004` | `9x - 4 = 20` | `x = \frac{8}{3}` | `x = \frac{8}{3}` | 1942.5ms | ✅ PASS |
| `lin_005` | `9x + 23 = 7x + 16` | `x = -\frac{7}{2}` | `x = -\frac{7}{2}` | 1809.3ms | ✅ PASS |
| `lin_006` | `6*(x - 15) = -30` | `x = 10` | `x = 10` | 1797.5ms | ✅ PASS |
| `lin_007` | `-7x - 23 = -12` | `x = -\frac{11}{7}` | `x = -\frac{11}{7}` | 1839.2ms | ✅ PASS |
| `lin_008` | `-6x - 2 = 8x - 30` | `x = 2` | `x = 2` | 1962.9ms | ✅ PASS |
| `lin_009` | `2*(x - 17) = -5` | `x = \frac{29}{2}` | `x = \frac{29}{2}` | 2047.3ms | ✅ PASS |
| `lin_010` | `-1x - 8 = 29` | `x = -37` | `x = -37` | 1970.6ms | ✅ PASS |
| `lin_011` | `3x + 21 = 9x - 6` | `x = \frac{9}{2}` | `x = \frac{9}{2}` | 1998.6ms | ✅ PASS |
| `lin_012` | `-7*(x + 16) = -9` | `x = -\frac{103}{7}` | `x = -\frac{103}{7}` | 2051.2ms | ✅ PASS |
| `lin_013` | `-7x + 5 = 4` | `x = \frac{1}{7}` | `x = \frac{1}{7}` | 1953.1ms | ✅ PASS |
| `lin_014` | `1x - 12 = -5x - 1` | `x = \frac{11}{6}` | `x = \frac{11}{6}` | 2016.6ms | ✅ PASS |
| `lin_015` | `1*(x - 29) = 24` | `x = 53` | `x = 53` | 1994.6ms | ✅ PASS |
| `lin_016` | `3x - 7 = -1` | `x = 2` | `x = 2` | 1911.4ms | ✅ PASS |
| `lin_017` | `5x - 25 = 8x - 5` | `x = -\frac{20}{3}` | `x = -\frac{20}{3}` | 1983.6ms | ✅ PASS |
| `lin_018` | `-6*(x - 3) = 2` | `x = \frac{8}{3}` | `x = \frac{8}{3}` | 2007.3ms | ✅ PASS |
| `lin_019` | `7x - 5 = 28` | `x = \frac{33}{7}` | `x = \frac{33}{7}` | 1982.4ms | ✅ PASS |
| `lin_020` | `8x - 14 = 5x + 24` | `x = \frac{38}{3}` | `x = \frac{38}{3}` | 1995.9ms | ✅ PASS |
| `lin_021` | `7*(x + 2) = 3` | `x = -\frac{11}{7}` | `x = -\frac{11}{7}` | 1950.2ms | ✅ PASS |
| `lin_022` | `-9x + 6 = -16` | `x = \frac{22}{9}` | `x = \frac{22}{9}` | 1952.7ms | ✅ PASS |
| `lin_023` | `-5x + 22 = 9x - 27` | `x = \frac{7}{2}` | `x = \frac{7}{2}` | 1975.5ms | ✅ PASS |
| `lin_024` | `-6*(x + 15) = 9` | `x = -\frac{33}{2}` | `x = -\frac{33}{2}` | 2004.4ms | ✅ PASS |
| `lin_025` | `5x + 0 = -21` | `x = -\frac{21}{5}` | `x = -\frac{21}{5}` | 1966.2ms | ✅ PASS |
| `lin_026` | `7x + 26 = -6x - 16` | `x = -\frac{42}{13}` | `x = -\frac{42}{13}` | 1974.4ms | ✅ PASS |
| `lin_027` | `6*(x + 13) = 0` | `x = -13` | `x = -13` | 2049.2ms | ✅ PASS |
| `lin_028` | `9x - 14 = 5` | `x = \frac{19}{9}` | `x = \frac{19}{9}` | 1945.1ms | ✅ PASS |
| `lin_029` | `4x + 12 = 9x - 11` | `x = \frac{23}{5}` | `x = \frac{23}{5}` | 1994.5ms | ✅ PASS |
| `lin_030` | `7*(x + 21) = 26` | `x = -\frac{121}{7}` | `x = -\frac{121}{7}` | 1930.9ms | ✅ PASS |
| `lin_031` | `4x - 3 = -18` | `x = -\frac{15}{4}` | `x = -\frac{15}{4}` | 1960.2ms | ✅ PASS |
| `lin_032` | `1x + 23 = -9x - 13` | `x = -\frac{18}{5}` | `x = -\frac{18}{5}` | 2036.7ms | ✅ PASS |
| `lin_033` | `-8*(x - 21) = 11` | `x = \frac{157}{8}` | `x = \frac{157}{8}` | 2006.0ms | ✅ PASS |
| `lin_034` | `6x + 21 = 3` | `x = -3` | `x = -3` | 2062.1ms | ✅ PASS |
| `lin_035` | `7x - 7 = -3x + 28` | `x = \frac{7}{2}` | `x = \frac{7}{2}` | 1992.0ms | ✅ PASS |
| `lin_036` | `-1*(x + 14) = 1` | `x = -15` | `x = -15` | 2016.9ms | ✅ PASS |
| `lin_037` | `6x + 2 = 19` | `x = \frac{17}{6}` | `x = \frac{17}{6}` | 1986.5ms | ✅ PASS |
| `lin_038` | `7x + 21 = -8x - 3` | `x = -\frac{8}{5}` | `x = -\frac{8}{5}` | 2037.3ms | ✅ PASS |
| `lin_039` | `1*(x - 10) = -1` | `x = 9` | `x = 9` | 2052.1ms | ✅ PASS |
| `lin_040` | `-6x - 2 = 14` | `x = -\frac{8}{3}` | `x = -\frac{8}{3}` | 2056.4ms | ✅ PASS |
| `lin_041` | `8x - 14 = -4x - 2` | `x = 1` | `x = 1` | 2009.8ms | ✅ PASS |
| `lin_042` | `5*(x + 23) = 16` | `x = -\frac{99}{5}` | `x = -\frac{99}{5}` | 1963.7ms | ✅ PASS |
| `lin_043` | `7x + 30 = -26` | `x = -8` | `x = -8` | 1885.8ms | ✅ PASS |
| `lin_044` | `-1x + 27 = 4x + 1` | `x = \frac{26}{5}` | `x = \frac{26}{5}` | 2005.2ms | ✅ PASS |
| `lin_045` | `-6*(x - 18) = 17` | `x = \frac{91}{6}` | `x = \frac{91}{6}` | 2023.3ms | ✅ PASS |
| `lin_046` | `5x - 21 = -2` | `x = \frac{19}{5}` | `x = \frac{19}{5}` | 1894.3ms | ✅ PASS |
| `lin_047` | `-9x - 25 = 7x - 30` | `x = \frac{5}{16}` | `x = \frac{5}{16}` | 1934.3ms | ✅ PASS |
| `lin_048` | `9*(x + 29) = 23` | `x = -\frac{238}{9}` | `x = -\frac{238}{9}` | 1935.5ms | ✅ PASS |
| `lin_049` | `-7x + 9 = 20` | `x = -\frac{11}{7}` | `x = -\frac{11}{7}` | 1975.8ms | ✅ PASS |
| `lin_050` | `-3x - 15 = -8x - 23` | `x = -\frac{8}{5}` | `x = -\frac{8}{5}` | 2017.0ms | ✅ PASS |
| `lin_051` | `9*(x - 13) = 12` | `x = \frac{43}{3}` | `x = \frac{43}{3}` | 1878.9ms | ✅ PASS |
| `lin_052` | `3x - 21 = -30` | `x = -3` | `x = -3` | 1950.7ms | ✅ PASS |
| `lin_053` | `2x + 12 = 8x + 7` | `x = \frac{5}{6}` | `x = \frac{5}{6}` | 1884.4ms | ✅ PASS |
| `lin_054` | `-5*(x + 4) = -16` | `x = -\frac{4}{5}` | `x = -\frac{4}{5}` | 2037.8ms | ✅ PASS |
| `lin_055` | `7x + 7 = -22` | `x = -\frac{29}{7}` | `x = -\frac{29}{7}` | 2001.2ms | ✅ PASS |
| `lin_056` | `8x - 12 = 5x - 25` | `x = -\frac{13}{3}` | `x = -\frac{13}{3}` | 1974.7ms | ✅ PASS |
| `lin_057` | `-4*(x + 29) = -22` | `x = -\frac{47}{2}` | `x = -\frac{47}{2}` | 2030.6ms | ✅ PASS |
| `lin_058` | `1x + 2 = -4` | `x = -6` | `x = -6` | 1939.9ms | ✅ PASS |
| `lin_059` | `4x + 21 = 9x - 21` | `x = \frac{42}{5}` | `x = \frac{42}{5}` | 1909.9ms | ✅ PASS |
| `lin_060` | `-3*(x - 6) = -30` | `x = 16` | `x = 16` | 1961.4ms | ✅ PASS |
| `lin_061` | `-6x - 6 = 26` | `x = -\frac{16}{3}` | `x = -\frac{16}{3}` | 1910.0ms | ✅ PASS |
| `lin_062` | `-7x - 27 = 4x + 23` | `x = -\frac{50}{11}` | `x = -\frac{50}{11}` | 1923.8ms | ✅ PASS |
| `lin_063` | `3*(x + 29) = 19` | `x = -\frac{68}{3}` | `x = -\frac{68}{3}` | 1916.9ms | ✅ PASS |
| `lin_064` | `-9x - 29 = 2` | `x = -\frac{31}{9}` | `x = -\frac{31}{9}` | 1887.9ms | ✅ PASS |
| `lin_065` | `7x - 10 = 1x + 13` | `x = \frac{23}{6}` | `x = \frac{23}{6}` | 1935.4ms | ✅ PASS |
| `lin_066` | `6*(x - 10) = 28` | `x = \frac{44}{3}` | `x = \frac{44}{3}` | 1915.3ms | ✅ PASS |
| `lin_067` | `-6x + 1 = 30` | `x = -\frac{29}{6}` | `x = -\frac{29}{6}` | 1941.8ms | ✅ PASS |
| `lin_068` | `6x + 6 = -4x + 9` | `x = \frac{3}{10}` | `x = \frac{3}{10}` | 1890.5ms | ✅ PASS |
| `lin_069` | `-5*(x + 7) = 3` | `x = -\frac{38}{5}` | `x = -\frac{38}{5}` | 1914.8ms | ✅ PASS |
| `lin_070` | `-3x - 3 = 9` | `x = -4` | `x = -4` | 1890.7ms | ✅ PASS |
| `lin_071` | `2x - 1 = -2x + 8` | `x = \frac{9}{4}` | `x = \frac{9}{4}` | 1887.5ms | ✅ PASS |
| `lin_072` | `-7*(x + 5) = -5` | `x = -\frac{30}{7}` | `x = -\frac{30}{7}` | 1979.8ms | ✅ PASS |
| `lin_073` | `-8x - 18 = 11` | `x = -\frac{29}{8}` | `x = -\frac{29}{8}` | 1921.9ms | ✅ PASS |
| `lin_074` | `-4x - 28 = -8x + 11` | `x = \frac{39}{4}` | `x = \frac{39}{4}` | 1854.5ms | ✅ PASS |
| `lin_075` | `6*(x + 25) = 18` | `x = -22` | `x = -22` | 1908.0ms | ✅ PASS |


### MATRIX (65/75 Passed - 86.7%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `mat_det_2x2_001` | `determinant` | `10` | `10` | 1891.6ms | ✅ PASS |
| `mat_det_3x3_002` | `determinant` | `3` | `3` | 1878.8ms | ✅ PASS |
| `mat_det_2x2_003` | `determinant` | `-3` | `-3` | 1921.3ms | ✅ PASS |
| `mat_det_3x3_004` | `determinant` | `2` | `2` | 1920.5ms | ✅ PASS |
| `mat_det_2x2_005` | `determinant` | `15` | `15` | 1916.6ms | ✅ PASS |
| `mat_det_3x3_006` | `determinant` | `-26` | `-26` | 1947.2ms | ✅ PASS |
| `mat_det_2x2_007` | `determinant` | `2` | `2` | 1966.0ms | ✅ PASS |
| `mat_det_3x3_008` | `determinant` | `6` | `6` | 1857.3ms | ✅ PASS |
| `mat_det_2x2_009` | `determinant` | `-12` | `-12` | 1993.2ms | ✅ PASS |
| `mat_det_3x3_010` | `determinant` | `9` | `9` | 1931.7ms | ✅ PASS |
| `mat_det_2x2_011` | `determinant` | `0` | `0` | 1948.4ms | ✅ PASS |
| `mat_det_3x3_012` | `determinant` | `-3` | `-3` | 1950.9ms | ✅ PASS |
| `mat_det_2x2_013` | `determinant` | `25` | `25` | 1998.5ms | ✅ PASS |
| `mat_det_3x3_014` | `determinant` | `0` | `0` | 1926.9ms | ✅ PASS |
| `mat_det_2x2_015` | `determinant` | `-4` | `-4` | 1898.2ms | ✅ PASS |
| `mat_det_3x3_016` | `determinant` | `33` | `33` | 1997.8ms | ✅ PASS |
| `mat_det_2x2_017` | `determinant` | `8` | `8` | 1914.1ms | ✅ PASS |
| `mat_det_3x3_018` | `determinant` | `-38` | `-38` | 1944.4ms | ✅ PASS |
| `mat_det_2x2_019` | `determinant` | `8` | `8` | 1905.3ms | ✅ PASS |
| `mat_det_3x3_020` | `determinant` | `-30` | `-30` | 1904.3ms | ✅ PASS |
| `mat_det_2x2_021` | `determinant` | `0` | `0` | 1915.0ms | ✅ PASS |
| `mat_det_3x3_022` | `determinant` | `-3` | `-3` | 1884.2ms | ✅ PASS |
| `mat_det_2x2_023` | `determinant` | `-4` | `-4` | 1932.0ms | ✅ PASS |
| `mat_det_3x3_024` | `determinant` | `18` | `18` | 1910.8ms | ✅ PASS |
| `mat_det_2x2_025` | `determinant` | `12` | `12` | 1915.4ms | ✅ PASS |
| `mat_mult_001` | `multiply` | `[[-9,9],[9,-9]]` | `[[-9,9],[9,-9]]` | 1998.0ms | ✅ PASS |
| `mat_mult_002` | `multiply` | `[[9,-5],[-3,7]]` | `[[9,-5],[-3,7]]` | 1852.2ms | ✅ PASS |
| `mat_mult_003` | `multiply` | `[[5,0],[-4,0]]` | `[[5,0],[-4,0]]` | 1953.7ms | ✅ PASS |
| `mat_mult_004` | `multiply` | `[[0,0],[6,6]]` | `[[0,0],[6,6]]` | 1904.3ms | ✅ PASS |
| `mat_mult_005` | `multiply` | `[[9,8],[6,4]]` | `[[9,8],[6,4]]` | 1097.9ms | ✅ PASS |
| `mat_mult_006` | `multiply` | `[[9,3],[-3,-1]]` | `[[9,3],[-3,-1]]` | 1.0ms | ✅ PASS |
| `mat_mult_007` | `multiply` | `[[2,-3],[-2,8]]` | `[[2,-3],[-2,8]]` | 1788.0ms | ✅ PASS |
| `mat_mult_008` | `multiply` | `[[-15,12],[9,-10]]` | `[[-15,12],[9,-10]]` | 2007.3ms | ✅ PASS |
| `mat_mult_009` | `multiply` | `[[3,-6],[1,-4]]` | `[[3,-6],[1,-4]]` | 1922.9ms | ✅ PASS |
| `mat_mult_010` | `multiply` | `[[-12,1],[-7,7]]` | `[[-12,1],[-7,7]]` | 1874.2ms | ✅ PASS |
| `mat_mult_011` | `multiply` | `[[0,7],[10,-9]]` | `[[0,7],[10,-9]]` | 1958.4ms | ✅ PASS |
| `mat_mult_012` | `multiply` | `[[-2,7],[-2,5]]` | `[[-2,7],[-2,5]]` | 1992.0ms | ✅ PASS |
| `mat_mult_013` | `multiply` | `[[6,12],[0,-6]]` | `[[6,12],[0,-6]]` | 1901.8ms | ✅ PASS |
| `mat_mult_014` | `multiply` | `[[0,0],[-13,-6]]` | `[[0,0],[-13,-6]]` | 2070.4ms | ✅ PASS |
| `mat_mult_015` | `multiply` | `[[1,-4],[-12,-1]]` | `[[1,-4],[-12,-1]]` | 2041.1ms | ✅ PASS |
| `mat_add_001` | `add` | `[[1,-7],[6,5]]` | `[[1,-7],[6,5]]` | 1904.3ms | ✅ PASS |
| `mat_subtract_002` | `subtract` | `[[1,-6],[3,4]]` | `[[1,-6],[3,4]]` | 1901.6ms | ✅ PASS |
| `mat_add_003` | `add` | `[[0,-10],[-3,-1]]` | `[[0,-10],[-3,-1]]` | 2025.2ms | ✅ PASS |
| `mat_subtract_004` | `subtract` | `[[4,0],[5,4]]` | `[[4,0],[5,4]]` | 2138.8ms | ✅ PASS |
| `mat_add_005` | `add` | `[[-2,-9],[0,8]]` | `[[-2,-9],[0,8]]` | 2109.3ms | ✅ PASS |
| `mat_subtract_006` | `subtract` | `[[-6,2],[-4,-1]]` | `[[-6,2],[-4,-1]]` | 2079.7ms | ✅ PASS |
| `mat_add_007` | `add` | `[[1,0],[0,1]]` | `[[1,0],[0,1]]` | 2022.3ms | ✅ PASS |
| `mat_subtract_008` | `subtract` | `[[-3,-5],[-2,-7]]` | `[[-3,-5],[-2,-7]]` | 2046.2ms | ✅ PASS |
| `mat_add_009` | `add` | `[[-8,1],[2,6]]` | `[[-8,1],[2,6]]` | 2046.3ms | ✅ PASS |
| `mat_subtract_010` | `subtract` | `[[-5,3],[-6,4]]` | `[[-5,3],[-6,4]]` | 2043.3ms | ✅ PASS |
| `mat_add_011` | `add` | `[[4,-3],[-5,2]]` | `[[4,-3],[-5,2]]` | 1977.8ms | ✅ PASS |
| `mat_subtract_012` | `subtract` | `[[0,1],[-1,0]]` | `[[0,1],[-1,0]]` | 2032.2ms | ✅ PASS |
| `mat_add_013` | `add` | `[[9,0],[-4,8]]` | `[[9,0],[-4,8]]` | 1888.1ms | ✅ PASS |
| `mat_subtract_014` | `subtract` | `[[1,-5],[8,-5]]` | `[[1,-5],[8,-5]]` | 1953.5ms | ✅ PASS |
| `mat_add_015` | `add` | `[[0,-4],[4,-2]]` | `[[0,-4],[4,-2]]` | 1816.2ms | ✅ PASS |
| `mat_trace_001` | `trace` | `2` | `2` | 1806.9ms | ✅ PASS |
| `mat_transpose_002` | `transpose` | `[[1,2],[-2,4]]` | `[[1,2],[-2,4]]` | 1869.0ms | ✅ PASS |
| `mat_trace_003` | `trace` | `0` | `0` | 1812.5ms | ✅ PASS |
| `mat_transpose_004` | `transpose` | `[[2,1],[-4,-3]]` | `[[2,1],[-4,-3]]` | 1877.4ms | ✅ PASS |
| `mat_trace_005` | `trace` | `6` | `6` | 1874.2ms | ✅ PASS |
| `mat_transpose_006` | `transpose` | `[[-3,1],[-2,-1]]` | `[[-3,1],[-2,-1]]` | 1955.8ms | ✅ PASS |
| `mat_trace_007` | `trace` | `7` | `7` | 1955.5ms | ✅ PASS |
| `mat_transpose_008` | `transpose` | `[[1,3],[-1,-4]]` | `[[1,3],[-1,-4]]` | 2007.3ms | ✅ PASS |
| `mat_trace_009` | `trace` | `7` | `7` | 1936.4ms | ✅ PASS |
| `mat_transpose_010` | `transpose` | `[[-4,4],[-4,2]]` | `[[-4,4],[-4,2]]` | 2068.0ms | ✅ PASS |
| `mat_rref_001` | `rref` | `[[1,0],[0,1]]` | `[[1.0, 0.0], [0.0, 1.0]]` | 1988.8ms | ❌ FAIL |
| `mat_rref_002` | `rref` | `[[1,0],[0,1]]` | `[[1,0],[0,1]]` | 1975.7ms | ❌ FAIL |
| `mat_rref_003` | `rref` | `[[1,0],[0,1]]` | `[[1.0, 0.0], [0.0, 1.0]]` | 1888.8ms | ❌ FAIL |
| `mat_rref_004` | `rref` | `[[1,0],[0,1]]` | `[[1,0],[0,1]]` | 1962.9ms | ❌ FAIL |
| `mat_rref_005` | `rref` | `[[1,0],[0,1]]` | `[[1.0, 0.0], [0.0, 1.0]]` | 1906.1ms | ❌ FAIL |
| `mat_rref_006` | `rref` | `[[1,0],[0,1]]` | `[[1,0],[0,1]]` | 1829.9ms | ❌ FAIL |
| `mat_rref_007` | `rref` | `[[1,0],[0,1]]` | `[[1.0, 0.0], [0.0, 1.0]]` | 1858.7ms | ❌ FAIL |
| `mat_rref_008` | `rref` | `[[1,0],[0,1]]` | `[[1,0],[0,1]]` | 1849.5ms | ❌ FAIL |
| `mat_rref_009` | `rref` | `[[1,0],[0,1]]` | `[[1.0, 0.0], [0.0, 1.0]]` | 1825.4ms | ❌ FAIL |
| `mat_rref_010` | `rref` | `[[1,0],[0,1]]` | `[[1,0],[0,1]]` | 1836.9ms | ❌ FAIL |


### ODE (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `ode_1st_homo_001` | `y' + 3*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_002` | `y' = 4*x` | `y(x) = 2 \cdot x^{2} + C` | `y(x) = 2 \cdot x^{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_003` | `y' + 3*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_004` | `y' = -2*x` | `y(x) = -x^{2} + C` | `y(x) = -x^{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_005` | `y' + 2*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_006` | `y' = 2*x` | `y(x) = x^{2} + C` | `y(x) = x^{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_007` | `y' + 2*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_008` | `y' = -1*x` | `y(x) = -\frac{x^{2}}{2} + C` | `y(x) = -\frac{x^{2}}{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_009` | `y' + 4*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_010` | `y' = -2*x` | `y(x) = -x^{2} + C` | `y(x) = -x^{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_011` | `y' + -1*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_012` | `y' = 2*x` | `y(x) = x^{2} + C` | `y(x) = x^{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_013` | `y' + 4*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_014` | `y' = -1*x` | `y(x) = -\frac{x^{2}}{2} + C` | `y(x) = -\frac{x^{2}}{2} + C` | 1036.4ms | ✅ PASS |
| `ode_1st_homo_015` | `y' + 4*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_016` | `y' = 4*x` | `y(x) = 2 \cdot x^{2} + C` | `y(x) = 2 \cdot x^{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_017` | `y' + 1*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_018` | `y' = 1*x` | `y(x) = \frac{x^{2}}{2} + C` | `y(x) = \frac{x^{2}}{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_019` | `y' + -1*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_020` | `y' = -1*x` | `y(x) = -\frac{x^{2}}{2} + C` | `y(x) = -\frac{x^{2}}{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_021` | `y' + 4*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_022` | `y' = 3*x` | `y(x) = \frac{3 \cdot x^{2}}{2} + C` | `y(x) = \frac{3 \cdot x^{2}}{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_023` | `y' + 3*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_024` | `y' = 3*x` | `y(x) = \frac{3 \cdot x^{2}}{2} + C` | `y(x) = \frac{3 \cdot x^{2}}{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_025` | `y' + 4*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_026` | `y' = -1*x` | `y(x) = -\frac{x^{2}}{2} + C` | `y(x) = -\frac{x^{2}}{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_027` | `y' + 3*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_028` | `y' = 1*x` | `y(x) = \frac{x^{2}}{2} + C` | `y(x) = \frac{x^{2}}{2} + C` | 1.0ms | ✅ PASS |
| `ode_1st_homo_029` | `y' + 2*y = 0` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{325368125^{x}}` | `y(x) = 0 + C \cdot \frac{119696244^{x}}{3253681...` | 1.0ms | ✅ PASS |
| `ode_1st_sep_030` | `y' = 4*x` | `y(x) = 2 \cdot x^{2} + C` | `y(x) = 2 \cdot x^{2} + C` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_001` | `y'' + 5*y' + 6*y = 0` | `y(x) = C_1 e^{-2x} + C_2 e^{-3x}` | `y(x) = C_1 e^{-2x} + C_2 e^{-3x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_002` | `y'' + 0*y' - 1*y = 0` | `y(x) = C_1 e^{x} + C_2 e^{-x}` | `y(x) = C_1 e^{x} + C_2 e^{-x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_003` | `y'' + 0*y' - 4*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{-2x}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_004` | `y'' + 1*y' - 2*y = 0` | `y(x) = C_1 e^{x} + C_2 e^{-2x}` | `y(x) = C_1 e^{x} + C_2 e^{-2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_005` | `y'' - 4*y' + 3*y = 0` | `y(x) = C_1 e^{3x} + C_2 e^{x}` | `y(x) = C_1 e^{3x} + C_2 e^{x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_006` | `y'' + 2*y' - 3*y = 0` | `y(x) = C_1 e^{x} + C_2 e^{-3x}` | `y(x) = C_1 e^{x} + C_2 e^{-3x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_007` | `y'' + 0*y' - 1*y = 0` | `y(x) = C_1 e^{x} + C_2 e^{-x}` | `y(x) = C_1 e^{x} + C_2 e^{-x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_008` | `y'' - 4*y' + 4*y = 0` | `y(x) = (C_1 + C_2 x)e^{2x}` | `y(x) = (C_1 + C_2 x)e^{2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_009` | `y'' + 0*y' - 1*y = 0` | `y(x) = C_1 e^{x} + C_2 e^{-x}` | `y(x) = C_1 e^{x} + C_2 e^{-x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_010` | `y'' + 2*y' - 3*y = 0` | `y(x) = C_1 e^{x} + C_2 e^{-3x}` | `y(x) = C_1 e^{x} + C_2 e^{-3x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_011` | `y'' - 2*y' - 3*y = 0` | `y(x) = C_1 e^{3x} + C_2 e^{-x}` | `y(x) = C_1 e^{3x} + C_2 e^{-x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_012` | `y'' + 1*y' - 6*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{-3x}` | `y(x) = C_1 e^{2x} + C_2 e^{-3x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_013` | `y'' - 3*y' + 2*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_014` | `y'' + 0*y' - 4*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{-2x}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_015` | `y'' + 0*y' - 9*y = 0` | `y(x) = C_1 e^{3x} + C_2 e^{-3x}` | `y(x) = C_1 e^{3x} + C_2 e^{-3x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_016` | `y'' + 0*y' - 4*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{-2x}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_017` | `y'' + 1*y' - 2*y = 0` | `y(x) = C_1 e^{x} + C_2 e^{-2x}` | `y(x) = C_1 e^{x} + C_2 e^{-2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_018` | `y'' + 5*y' + 6*y = 0` | `y(x) = C_1 e^{-2x} + C_2 e^{-3x}` | `y(x) = C_1 e^{-2x} + C_2 e^{-3x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_019` | `y'' - 5*y' + 6*y = 0` | `y(x) = C_1 e^{3x} + C_2 e^{2x}` | `y(x) = C_1 e^{3x} + C_2 e^{2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_020` | `y'' - 3*y' + 2*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_021` | `y'' - 3*y' + 2*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_022` | `y'' + 3*y' + 2*y = 0` | `y(x) = C_1 e^{-x} + C_2 e^{-2x}` | `y(x) = C_1 e^{-x} + C_2 e^{-2x}` | 1.0ms | ✅ PASS |
| `ode_2nd_homo_023` | `y'' - 6*y' + 9*y = 0` | `y(x) = (C_1 + C_2 x)e^{3x}` | `y(x) = (C_1 + C_2 x)e^{3x}` | 1270.0ms | ✅ PASS |
| `ode_2nd_homo_024` | `y'' - 3*y' + 2*y = 0` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | `y(x) = C_1 e^{2x} + C_2 e^{x}` | 1907.4ms | ✅ PASS |
| `ode_2nd_homo_025` | `y'' + 6*y' + 9*y = 0` | `y(x) = (C_1 + C_2 x)e^{-3x}` | `y(x) = (C_1 + C_2 x)e^{-3x}` | 1939.0ms | ✅ PASS |
| `ode_2nd_nonhomo_001` | `y'' - 4*y = 1` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{1}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{1}{4}` | 1887.2ms | ✅ PASS |
| `ode_2nd_nonhomo_002` | `y'' - 4*y = 2` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{1}{2}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{1}{2}` | 1861.3ms | ✅ PASS |
| `ode_2nd_nonhomo_003` | `y'' - 4*y = 3` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{3}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{3}{4}` | 1843.3ms | ✅ PASS |
| `ode_2nd_nonhomo_004` | `y'' - 4*y = 4` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -1` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -1` | 1973.7ms | ✅ PASS |
| `ode_2nd_nonhomo_005` | `y'' - 4*y = 5` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{5}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{5}{4}` | 2010.1ms | ✅ PASS |
| `ode_2nd_nonhomo_006` | `y'' - 4*y = 6` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{3}{2}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{3}{2}` | 1887.8ms | ✅ PASS |
| `ode_2nd_nonhomo_007` | `y'' - 4*y = 7` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{7}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{7}{4}` | 1934.3ms | ✅ PASS |
| `ode_2nd_nonhomo_008` | `y'' - 4*y = 8` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -2` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -2` | 1884.7ms | ✅ PASS |
| `ode_2nd_nonhomo_009` | `y'' - 4*y = 9` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{9}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{9}{4}` | 1882.3ms | ✅ PASS |
| `ode_2nd_nonhomo_010` | `y'' - 4*y = 10` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{5}{2}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{5}{2}` | 1947.5ms | ✅ PASS |
| `ode_2nd_nonhomo_011` | `y'' - 4*y = 11` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{11}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{11}{4}` | 1962.9ms | ✅ PASS |
| `ode_2nd_nonhomo_012` | `y'' - 4*y = 12` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -3` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -3` | 2016.6ms | ✅ PASS |
| `ode_2nd_nonhomo_013` | `y'' - 4*y = 13` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{13}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{13}{4}` | 1916.9ms | ✅ PASS |
| `ode_2nd_nonhomo_014` | `y'' - 4*y = 14` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{7}{2}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{7}{2}` | 1896.4ms | ✅ PASS |
| `ode_2nd_nonhomo_015` | `y'' - 4*y = 15` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{15}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{15}{4}` | 1899.0ms | ✅ PASS |
| `ode_2nd_nonhomo_016` | `y'' - 4*y = 16` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -4` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -4` | 1930.8ms | ✅ PASS |
| `ode_2nd_nonhomo_017` | `y'' - 4*y = 17` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{17}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{17}{4}` | 1822.0ms | ✅ PASS |
| `ode_2nd_nonhomo_018` | `y'' - 4*y = 18` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{9}{2}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{9}{2}` | 1913.0ms | ✅ PASS |
| `ode_2nd_nonhomo_019` | `y'' - 4*y = 19` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{19}{4}` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -\frac{19}{4}` | 2147.2ms | ✅ PASS |
| `ode_2nd_nonhomo_020` | `y'' - 4*y = 20` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -5` | `y(x) = C_1 e^{2x} + C_2 e^{-2x} -5` | 2014.2ms | ✅ PASS |


### QUADRATIC (57/75 Passed - 76.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `quad_int_001` | `-1x^2 + 2x + 48 = 0` | `x_1 = -6, \quad x_2 = 8` | `x_1 = -6, \quad x_2 = 8` | 1928.7ms | ✅ PASS |
| `quad_int_002` | `x^2 - 19x + 90 = 0` | `x_1 = 9, \quad x_2 = 10` | `x_1 = 9, \quad x_2 = 10` | 1904.2ms | ✅ PASS |
| `quad_int_003` | `3x^2 + 0x - 192 = 0` | `x_1 = -8, \quad x_2 = 8` | `N/A` | 0.0ms | ❌ FAIL |
| `quad_int_004` | `x^2 + 2x - 24 = 0` | `x_1 = -6, \quad x_2 = 4` | `x_1 = -6, \quad x_2 = 4` | 1895.1ms | ✅ PASS |
| `quad_int_005` | `x^2 - 2x - 63 = 0` | `x_1 = -7, \quad x_2 = 9` | `x_1 = -7, \quad x_2 = 9` | 1903.9ms | ✅ PASS |
| `quad_int_006` | `-1x^2 - 4x + 0 = 0` | `x_1 = -4, \quad x_2 = 0` | `x_1 = -4, \quad x_2 = 0` | 1894.9ms | ✅ PASS |
| `quad_int_007` | `x^2 - 6x + 5 = 0` | `x_1 = 1, \quad x_2 = 5` | `x_1 = 1, \quad x_2 = 5` | 1911.6ms | ✅ PASS |
| `quad_int_008` | `x^2 + 3x + 0 = 0` | `x_1 = -3, \quad x_2 = 0` | `x_1 = -3, \quad x_2 = 0` | 1929.6ms | ✅ PASS |
| `quad_int_009` | `2x^2 + 16x + 14 = 0` | `x_1 = -7, \quad x_2 = -1` | `x_1 = -7, \quad x_2 = -1` | 1900.4ms | ✅ PASS |
| `quad_int_010` | `-1x^2 + 5x - 6 = 0` | `x_1 = 2, \quad x_2 = 3` | `x_1 = 2, \quad x_2 = 3` | 1927.1ms | ✅ PASS |
| `quad_int_011` | `x^2 + 1x - 6 = 0` | `x_1 = -3, \quad x_2 = 2` | `x_1 = -3, \quad x_2 = 2` | 1922.1ms | ✅ PASS |
| `quad_int_012` | `-1x^2 + 2x + 8 = 0` | `x_1 = -2, \quad x_2 = 4` | `x_1 = -2, \quad x_2 = 4` | 1952.9ms | ✅ PASS |
| `quad_int_013` | `3x^2 + 21x - 54 = 0` | `x_1 = -9, \quad x_2 = 2` | `x_1 = -9, \quad x_2 = 2` | 1915.3ms | ✅ PASS |
| `quad_int_014` | `x^2 + 0x - 16 = 0` | `x_1 = -4, \quad x_2 = 4` | `N/A` | 0.0ms | ❌ FAIL |
| `quad_int_015` | `x^2 + 11x + 30 = 0` | `x_1 = -6, \quad x_2 = -5` | `x_1 = -6, \quad x_2 = -5` | 1878.4ms | ✅ PASS |
| `quad_int_016` | `2x^2 + 16x - 40 = 0` | `x_1 = -10, \quad x_2 = 2` | `x_1 = -10, \quad x_2 = 2` | 1930.8ms | ✅ PASS |
| `quad_int_017` | `x^2 - 6x + 5 = 0` | `x_1 = 1, \quad x_2 = 5` | `x_1 = 1, \quad x_2 = 5` | 1897.1ms | ✅ PASS |
| `quad_int_018` | `x^2 + 13x + 12 = 0` | `x_1 = -12, \quad x_2 = -1` | `x_1 = -12, \quad x_2 = -1` | 1923.5ms | ✅ PASS |
| `quad_int_019` | `3x^2 - 12x - 15 = 0` | `x_1 = -1, \quad x_2 = 5` | `x_1 = -1, \quad x_2 = 5` | 1958.6ms | ✅ PASS |
| `quad_int_020` | `x^2 + 1x - 30 = 0` | `x_1 = -6, \quad x_2 = 5` | `x_1 = -6, \quad x_2 = 5` | 1920.0ms | ✅ PASS |
| `quad_int_021` | `2x^2 - 34x + 140 = 0` | `x_1 = 7, \quad x_2 = 10` | `x_1 = 7, \quad x_2 = 10` | 1942.1ms | ✅ PASS |
| `quad_int_022` | `3x^2 - 51x + 180 = 0` | `x_1 = 5, \quad x_2 = 12` | `x_1 = 5, \quad x_2 = 12` | 1949.8ms | ✅ PASS |
| `quad_int_023` | `3x^2 - 15x - 198 = 0` | `x_1 = -6, \quad x_2 = 11` | `x_1 = -6, \quad x_2 = 11` | 1899.1ms | ✅ PASS |
| `quad_int_024` | `2x^2 - 6x - 36 = 0` | `x_1 = -3, \quad x_2 = 6` | `x_1 = -3, \quad x_2 = 6` | 1928.9ms | ✅ PASS |
| `quad_int_025` | `x^2 - 14x + 45 = 0` | `x_1 = 5, \quad x_2 = 9` | `x_1 = 5, \quad x_2 = 9` | 1886.0ms | ✅ PASS |
| `quad_irr_001` | `x^2 + 1x - 7 = 0` | `x_1 = -3.192582, \quad x_2 = 2.192582` | `x_1 = -3.192582, \quad x_2 = 2.192582` | 1934.2ms | ✅ PASS |
| `quad_irr_002` | `2x^2 - 3x - 7 = 0` | `x_1 = -1.265564, \quad x_2 = 2.765564` | `x_1 = -1.265564, \quad x_2 = 2.765564` | 1946.8ms | ✅ PASS |
| `quad_irr_003` | `3x^2 - 7x - 1 = 0` | `x_1 = -0.135042, \quad x_2 = 2.468375` | `x_1 = -0.135042, \quad x_2 = 2.468375` | 1924.6ms | ✅ PASS |
| `quad_irr_004` | `3x^2 - 3x - 7 = 0` | `x_1 = -1.107275, \quad x_2 = 2.107275` | `x_1 = -1.107275, \quad x_2 = 2.107275` | 1953.2ms | ✅ PASS |
| `quad_irr_005` | `3x^2 + 3x - 2 = 0` | `x_1 = -1.457427, \quad x_2 = 0.457427` | `x_1 = -1.457427, \quad x_2 = 0.457427` | 1856.1ms | ✅ PASS |
| `quad_irr_006` | `3x^2 - 5x - 5 = 0` | `x_1 = -0.703257, \quad x_2 = 2.369924` | `x_1 = -0.703257, \quad x_2 = 2.369924` | 1869.3ms | ✅ PASS |
| `quad_irr_007` | `2x^2 - 3x - 5 = 0` | `x_1 = -1, \quad x_2 = \frac{5}{2}` | `x_1 = -1, \quad x_2 = \frac{5}{2}` | 1955.4ms | ✅ PASS |
| `quad_irr_008` | `2x^2 - 5x - 11 = 0` | `x_1 = -1.407536, \quad x_2 = 3.907536` | `x_1 = -1.407536, \quad x_2 = 3.907536` | 1824.6ms | ✅ PASS |
| `quad_irr_009` | `2x^2 + 1x - 4 = 0` | `x_1 = -1.686141, \quad x_2 = 1.186141` | `x_1 = -1.686141, \quad x_2 = 1.186141` | 1850.7ms | ✅ PASS |
| `quad_irr_010` | `x^2 - 7x - 7 = 0` | `x_1 = -0.887482, \quad x_2 = 7.887482` | `x_1 = -0.887482, \quad x_2 = 7.887482` | 1909.6ms | ✅ PASS |
| `quad_irr_011` | `x^2 - 7x - 2 = 0` | `x_1 = -0.274917, \quad x_2 = 7.274917` | `x_1 = -0.274917, \quad x_2 = 7.274917` | 1906.2ms | ✅ PASS |
| `quad_irr_012` | `x^2 - 5x - 1 = 0` | `x_1 = -0.192582, \quad x_2 = 5.192582` | `x_1 = -0.192582, \quad x_2 = 5.192582` | 1885.6ms | ✅ PASS |
| `quad_irr_013` | `2x^2 + 7x - 11 = 0` | `x_1 = -4.676175, \quad x_2 = 1.176175` | `x_1 = -4.676175, \quad x_2 = 1.176175` | 1930.3ms | ✅ PASS |
| `quad_irr_014` | `2x^2 + 3x - 3 = 0` | `x_1 = -2.186141, \quad x_2 = 0.686141` | `x_1 = -2.186141, \quad x_2 = 0.686141` | 1976.5ms | ✅ PASS |
| `quad_irr_015` | `3x^2 + 7x + 1 = 0` | `x_1 = -2.18046, \quad x_2 = -0.152873` | `x_1 = -2.18046, \quad x_2 = -0.152873` | 2009.3ms | ✅ PASS |
| `quad_irr_016` | `3x^2 - 5x - 1 = 0` | `x_1 = -0.18046, \quad x_2 = 1.847127` | `x_1 = -0.18046, \quad x_2 = 1.847127` | 1962.0ms | ✅ PASS |
| `quad_irr_017` | `3x^2 + 1x - 4 = 0` | `x_1 = -\frac{4}{3}, \quad x_2 = 1` | `x_1 = -\frac{4}{3}, \quad x_2 = 1` | 1900.8ms | ✅ PASS |
| `quad_irr_018` | `2x^2 + 3x - 11 = 0` | `x_1 = -3.212214, \quad x_2 = 1.712214` | `x_1 = -3.212214, \quad x_2 = 1.712214` | 1947.3ms | ✅ PASS |
| `quad_irr_019` | `3x^2 + 5x - 11 = 0` | `x_1 = -2.921661, \quad x_2 = 1.254994` | `x_1 = -2.921661, \quad x_2 = 1.254994` | 1960.6ms | ✅ PASS |
| `quad_irr_020` | `2x^2 + 3x - 5 = 0` | `x_1 = -\frac{5}{2}, \quad x_2 = 1` | `x_1 = -\frac{5}{2}, \quad x_2 = 1` | 1933.9ms | ✅ PASS |
| `quad_irr_021` | `3x^2 - 5x - 5 = 0` | `x_1 = -0.703257, \quad x_2 = 2.369924` | `x_1 = -0.703257, \quad x_2 = 2.369924` | 1906.0ms | ✅ PASS |
| `quad_irr_022` | `2x^2 + 3x - 11 = 0` | `x_1 = -3.212214, \quad x_2 = 1.712214` | `x_1 = -3.212214, \quad x_2 = 1.712214` | 1974.0ms | ✅ PASS |
| `quad_irr_023` | `3x^2 + 3x - 3 = 0` | `x_1 = -1.618034, \quad x_2 = 0.618034` | `x_1 = -1.618034, \quad x_2 = 0.618034` | 1927.0ms | ✅ PASS |
| `quad_irr_024` | `3x^2 - 7x - 7 = 0` | `x_1 = -0.755427, \quad x_2 = 3.08876` | `x_1 = -0.755427, \quad x_2 = 3.08876` | 1928.0ms | ✅ PASS |
| `quad_irr_025` | `x^2 - 5x - 7 = 0` | `x_1 = -1.140055, \quad x_2 = 6.140055` | `x_1 = -1.140055, \quad x_2 = 6.140055` | 1953.8ms | ✅ PASS |
| `quad_cplx_001` | `x^2 - 2x + 25 = 0` | `x = 1 \pm 4.898979\,i` | `[1 - 2*sqrt(6)*I, 1 + 2*sqrt(6)*I]` | 1954.0ms | ❌ FAIL |
| `quad_cplx_002` | `2x^2 + 4x + 29 = 0` | `x = -1 \pm 3.674235\,i` | `[-1 - 3*sqrt(6)*I/2, -1 + 3*sqrt(6)*I/2]` | 1860.7ms | ❌ FAIL |
| `quad_cplx_003` | `3x^2 + 0x + 10 = 0` | `x = \pm 1.825742\,i` | `N/A` | 0.0ms | ❌ FAIL |
| `quad_cplx_004` | `2x^2 + 4x + 13 = 0` | `x = -1 \pm 2.345208\,i` | `[-1 - sqrt(22)*I/2, -1 + sqrt(22)*I/2]` | 1911.9ms | ❌ FAIL |
| `quad_cplx_005` | `2x^2 + 2x + 20 = 0` | `x = -0.5 \pm 3.122499\,i` | `[-1/2 - sqrt(39)*I/2, -1/2 + sqrt(39)*I/2]` | 2014.5ms | ❌ FAIL |
| `quad_cplx_006` | `2x^2 - 2x + 20 = 0` | `x = 0.5 \pm 3.122499\,i` | `[1/2 - sqrt(39)*I/2, 1/2 + sqrt(39)*I/2]` | 1947.2ms | ❌ FAIL |
| `quad_cplx_007` | `3x^2 - 2x + 13 = 0` | `x = 0.333333 \pm 2.054805\,i` | `[1/3 - sqrt(38)*I/3, 1/3 + sqrt(38)*I/3]` | 1911.0ms | ❌ FAIL |
| `quad_cplx_008` | `x^2 + 4x + 10 = 0` | `x = -2 \pm 2.44949\,i` | `[-2 - sqrt(6)*I, -2 + sqrt(6)*I]` | 1887.6ms | ❌ FAIL |
| `quad_cplx_009` | `3x^2 + 4x + 29 = 0` | `x = -0.666667 \pm 3.036811\,i` | `[-2/3 - sqrt(83)*I/3, -2/3 + sqrt(83)*I/3]` | 1896.5ms | ❌ FAIL |
| `quad_cplx_010` | `3x^2 + 2x + 17 = 0` | `x = -0.333333 \pm 2.357023\,i` | `[-1/3 - 5*sqrt(2)*I/3, -1/3 + 5*sqrt(2)*I/3]` | 1937.2ms | ❌ FAIL |
| `quad_cplx_011` | `x^2 - 2x + 10 = 0` | `x = 1 \pm 3\,i` | `[1 - 3*I, 1 + 3*I]` | 1922.2ms | ❌ FAIL |
| `quad_cplx_012` | `x^2 + 0x + 25 = 0` | `x = \pm 5\,i` | `N/A` | 0.0ms | ❌ FAIL |
| `quad_cplx_013` | `2x^2 + 2x + 17 = 0` | `x = -0.5 \pm 2.872281\,i` | `[-1/2 - sqrt(33)*I/2, -1/2 + sqrt(33)*I/2]` | 1897.1ms | ❌ FAIL |
| `quad_cplx_014` | `2x^2 - 2x + 29 = 0` | `x = 0.5 \pm 3.774917\,i` | `[1/2 - sqrt(57)*I/2, 1/2 + sqrt(57)*I/2]` | 1862.3ms | ❌ FAIL |
| `quad_cplx_015` | `3x^2 - 4x + 13 = 0` | `x = 0.666667 \pm 1.972027\,i` | `[2/3 - sqrt(35)*I/3, 2/3 + sqrt(35)*I/3]` | 1843.5ms | ❌ FAIL |
| `quad_rep_001` | `x^2 + 14x + 49 = 0` | `x = -7` | `x = -7` | 1886.6ms | ✅ PASS |
| `quad_rep_002` | `x^2 - 16x + 64 = 0` | `x = 8` | `x = 8` | 1920.3ms | ✅ PASS |
| `quad_rep_003` | `x^2 + 0x + 0 = 0` | `x = 0` | `N/A` | 0.0ms | ❌ FAIL |
| `quad_rep_004` | `x^2 - 4x + 4 = 0` | `x = 2` | `x = 2` | 1904.5ms | ✅ PASS |
| `quad_rep_005` | `x^2 - 16x + 64 = 0` | `x = 8` | `x = 8` | 1939.5ms | ✅ PASS |
| `quad_rep_006` | `x^2 - 4x + 4 = 0` | `x = 2` | `x = 2` | 1893.8ms | ✅ PASS |
| `quad_rep_007` | `x^2 + 14x + 49 = 0` | `x = -7` | `x = -7` | 1913.6ms | ✅ PASS |
| `quad_rep_008` | `x^2 + 16x + 64 = 0` | `x = -8` | `x = -8` | 1890.3ms | ✅ PASS |
| `quad_rep_009` | `x^2 + 2x + 1 = 0` | `x = -1` | `x = -1` | 1920.4ms | ✅ PASS |
| `quad_rep_010` | `x^2 - 14x + 49 = 0` | `x = 7` | `x = 7` | 1862.6ms | ✅ PASS |


### RADICAL (54/75 Passed - 72.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `rad_single_001` | `sqrt(3x + 8) = 3` | `x = \frac{1}{3}` | `x = \frac{1}{3}` | 1945.6ms | ✅ PASS |
| `rad_double_002` | `sqrt(4x + 12) = sqrt(3x + 27)` | `x_1 = 15, \quad x_2 = 1688849860263944/112589990684263` | `[15]` | 2036.1ms | ❌ FAIL |
| `rad_ext_003` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 2048.1ms | ✅ PASS |
| `rad_single_004` | `sqrt(3x + 7) = 2` | `x = -1` | `x = -1` | 1930.3ms | ✅ PASS |
| `rad_double_005` | `sqrt(5x + 4) = sqrt(4x + 18)` | `x_1 = 14` | `x_1 = 14` | 2021.1ms | ✅ PASS |
| `rad_ext_006` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 1975.2ms | ✅ PASS |
| `rad_single_007` | `sqrt(4x + 10) = 5` | `x = \frac{15}{4}` | `x = \frac{15}{4}` | 1977.0ms | ✅ PASS |
| `rad_double_008` | `sqrt(5x + 9) = sqrt(4x + 23)` | `x_1 = 14` | `x_1 = 14` | 1955.7ms | ✅ PASS |
| `rad_ext_009` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 1970.4ms | ✅ PASS |
| `rad_single_010` | `sqrt(4x + 13) = 3` | `x = -1` | `x = -1` | 1969.3ms | ✅ PASS |
| `rad_double_011` | `sqrt(4x + 4) = sqrt(3x + 21)` | `x_1 = 1196268651020304/70368744177665, \quad x_2 = 17` | `[17]` | 2109.9ms | ❌ FAIL |
| `rad_ext_012` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 2031.8ms | ✅ PASS |
| `rad_single_013` | `sqrt(1x + 6) = 6` | `x = 30` | `x = 30` | 1981.3ms | ✅ PASS |
| `rad_double_014` | `sqrt(3x + 9) = sqrt(2x + 25)` | `x_1 = 16, \quad x_2 = 2251799813685249/140737488355328` | `[16]` | 1914.9ms | ❌ FAIL |
| `rad_ext_015` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 1913.4ms | ✅ PASS |
| `rad_single_016` | `sqrt(1x + 9) = 3` | `x = 0` | `x = 0` | 1990.0ms | ✅ PASS |
| `rad_double_017` | `sqrt(5x + 7) = sqrt(4x + 28)` | `x_1 = 21, \quad x_2 = 5910974510923777/281474976710656` | `[21]` | 2013.5ms | ❌ FAIL |
| `rad_ext_018` | `sqrt(x + 6) = x - 2` | `x = \frac{5 + \sqrt{33}}{2}` | `x = \frac{5 + \sqrt{33}}{2}` | 1957.4ms | ✅ PASS |
| `rad_single_019` | `sqrt(1x + 4) = 3` | `x = 5` | `x = 5` | 1965.7ms | ✅ PASS |
| `rad_double_020` | `sqrt(2x + 5) = sqrt(1x + 24)` | `x_1 = 19, \quad x_2 = 5348024557502482/281474976710657` | `[19]` | 2106.3ms | ❌ FAIL |
| `rad_ext_021` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 2109.6ms | ✅ PASS |
| `rad_single_022` | `sqrt(3x + 3) = 2` | `x = \frac{1}{3}` | `x = \frac{1}{3}` | 2122.6ms | ✅ PASS |
| `rad_double_023` | `sqrt(3x + 12) = sqrt(2x + 28)` | `x = 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\...` | `[16]` | 2134.4ms | ❌ FAIL |
| `rad_ext_024` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 1976.6ms | ✅ PASS |
| `rad_single_025` | `sqrt(1x + 6) = 7` | `x = 43` | `x = 43` | 1949.4ms | ✅ PASS |
| `rad_double_026` | `sqrt(5x + 14) = sqrt(4x + 26)` | `x_1 = 12, \quad x_2 = 1688849860263937/140737488355328` | `[12]` | 2092.2ms | ❌ FAIL |
| `rad_ext_027` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 1983.6ms | ✅ PASS |
| `rad_single_028` | `sqrt(4x + 1) = 4` | `x = \frac{15}{4}` | `x = \frac{15}{4}` | 1899.2ms | ✅ PASS |
| `rad_double_029` | `sqrt(2x + 3) = sqrt(1x + 17)` | `x_1 = 14` | `x_1 = 14` | 2012.7ms | ✅ PASS |
| `rad_ext_030` | `sqrt(x + 6) = x - 2` | `x = \frac{5 + \sqrt{33}}{2}` | `x = \frac{5 + \sqrt{33}}{2}` | 1962.5ms | ✅ PASS |
| `rad_single_031` | `sqrt(1x + 8) = 4` | `x = 8` | `x = 8` | 1976.8ms | ✅ PASS |
| `rad_double_032` | `sqrt(2x + 15) = sqrt(1x + 27)` | `x = 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\...` | `[12]` | 2000.8ms | ❌ FAIL |
| `rad_ext_033` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 2018.5ms | ✅ PASS |
| `rad_single_034` | `sqrt(2x + 8) = 2` | `x = -2` | `x = -2` | 2050.6ms | ✅ PASS |
| `rad_double_035` | `sqrt(4x + 4) = sqrt(3x + 22)` | `x_1 = 18, \quad x_2 = 2533274790395905/140737488355328` | `[18]` | 2048.7ms | ❌ FAIL |
| `rad_ext_036` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 2076.7ms | ✅ PASS |
| `rad_single_037` | `sqrt(1x + 7) = 5` | `x = 18` | `x = 18` | 2030.0ms | ✅ PASS |
| `rad_double_038` | `sqrt(2x + 8) = sqrt(1x + 25)` | `x = 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\...` | `[17]` | 2078.3ms | ❌ FAIL |
| `rad_ext_039` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 1957.4ms | ✅ PASS |
| `rad_single_040` | `sqrt(2x + 9) = 4` | `x = \frac{7}{2}` | `x = \frac{7}{2}` | 2038.0ms | ✅ PASS |
| `rad_double_041` | `sqrt(5x + 5) = sqrt(4x + 26)` | `x_1 = 1182194902184752/56294995342131, \quad x_2 = 21` | `[21]` | 2024.0ms | ❌ FAIL |
| `rad_ext_042` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 1948.9ms | ✅ PASS |
| `rad_single_043` | `sqrt(3x + 2) = 7` | `x = \frac{47}{3}` | `x = \frac{47}{3}` | 1943.2ms | ✅ PASS |
| `rad_double_044` | `sqrt(3x + 10) = sqrt(2x + 28)` | `x_1 = 18, \quad x_2 = 5066549580791825/281474976710657` | `[18]` | 1976.0ms | ❌ FAIL |
| `rad_ext_045` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 1882.9ms | ✅ PASS |
| `rad_single_046` | `sqrt(2x + 11) = 4` | `x = \frac{5}{2}` | `x = \frac{5}{2}` | 1929.7ms | ✅ PASS |
| `rad_double_047` | `sqrt(3x + 8) = sqrt(2x + 17)` | `x_1 = 2533274790395912/281474976710657, \quad x_2 = 9` | `[9]` | 2050.1ms | ❌ FAIL |
| `rad_ext_048` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 1889.2ms | ✅ PASS |
| `rad_single_049` | `sqrt(4x + 11) = 5` | `x = \frac{7}{2}` | `x = \frac{7}{2}` | 1980.3ms | ✅ PASS |
| `rad_double_050` | `sqrt(4x + 9) = sqrt(3x + 17)` | `x_1 = 1801439850948199/225179981368525, \quad x_2 = 8` | `[8]` | 1983.4ms | ❌ FAIL |
| `rad_ext_051` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 1971.8ms | ✅ PASS |
| `rad_single_052` | `sqrt(1x + 7) = 3` | `x = 2` | `x = 2` | 2005.8ms | ✅ PASS |
| `rad_double_053` | `sqrt(4x + 10) = sqrt(3x + 25)` | `x_1 = 15` | `x_1 = 15` | 1946.3ms | ✅ PASS |
| `rad_ext_054` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 1977.4ms | ✅ PASS |
| `rad_single_055` | `sqrt(1x + 1) = 4` | `x = 15` | `x = 15` | 1875.4ms | ✅ PASS |
| `rad_double_056` | `sqrt(3x + 12) = sqrt(2x + 25)` | `x = 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\...` | `[13]` | 2049.4ms | ❌ FAIL |
| `rad_ext_057` | `sqrt(x + 6) = x - 2` | `x = \frac{5 + \sqrt{33}}{2}` | `x = \frac{5 + \sqrt{33}}{2}` | 1921.2ms | ✅ PASS |
| `rad_single_058` | `sqrt(2x + 10) = 6` | `x = 13` | `x = 13` | 2101.8ms | ✅ PASS |
| `rad_double_059` | `sqrt(5x + 2) = sqrt(4x + 18)` | `x_1 = 16, \quad x_2 = 4503599627370497/281474976710656` | `[16]` | 2079.7ms | ❌ FAIL |
| `rad_ext_060` | `sqrt(x + 6) = x - 2` | `x = \frac{5 + \sqrt{33}}{2}` | `x = \frac{5 + \sqrt{33}}{2}` | 2065.2ms | ✅ PASS |
| `rad_single_061` | `sqrt(2x + 7) = 4` | `x = \frac{9}{2}` | `x = \frac{9}{2}` | 2101.4ms | ✅ PASS |
| `rad_double_062` | `sqrt(2x + 8) = sqrt(1x + 20)` | `x = 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\,i, \; 0 \pm 0\...` | `[12]` | 1830.7ms | ❌ FAIL |
| `rad_ext_063` | `sqrt(x + 11) = x - 3` | `x = \frac{7 + \sqrt{57}}{2}` | `x = \frac{7 + \sqrt{57}}{2}` | 2320.1ms | ✅ PASS |
| `rad_single_064` | `sqrt(1x + 8) = 6` | `x = 28` | `x = 28` | 2478.9ms | ✅ PASS |
| `rad_double_065` | `sqrt(2x + 2) = sqrt(1x + 29)` | `x_1 = 27` | `x_1 = 27` | 2338.2ms | ✅ PASS |
| `rad_ext_066` | `sqrt(x + 6) = x - 2` | `x = \frac{5 + \sqrt{33}}{2}` | `x = \frac{5 + \sqrt{33}}{2}` | 2149.1ms | ✅ PASS |
| `rad_single_067` | `sqrt(3x + 8) = 5` | `x = \frac{17}{3}` | `[17/3]` | 1118331.4ms | ❌ FAIL |
| `rad_double_068` | `sqrt(4x + 5) = sqrt(3x + 27)` | `x_1 = 2064149829211471/93824992236885, \quad x_2 = 22` | `[22]` | 1084.1ms | ❌ FAIL |
| `rad_ext_069` | `sqrt(x + 6) = x - 2` | `x = \frac{5 + \sqrt{33}}{2}` | `x = \frac{5 + \sqrt{33}}{2}` | 1315.6ms | ✅ PASS |
| `rad_single_070` | `sqrt(2x + 2) = 6` | `x = 17` | `x = 17` | 1.0ms | ✅ PASS |
| `rad_double_071` | `sqrt(2x + 4) = sqrt(1x + 27)` | `x_1 = 23, \quad x_2 = 3236962232172566/140737488355329` | `[23]` | 2113.9ms | ❌ FAIL |
| `rad_ext_072` | `sqrt(x + 3) = x - 1` | `x = \frac{3 + \sqrt{17}}{2}` | `x = \frac{3 + \sqrt{17}}{2}` | 1959.2ms | ✅ PASS |
| `rad_single_073` | `sqrt(3x + 3) = 2` | `x = \frac{1}{3}` | `x = \frac{1}{3}` | 1921.4ms | ✅ PASS |
| `rad_double_074` | `sqrt(3x + 7) = sqrt(2x + 25)` | `x_1 = 18, \quad x_2 = 2533274790395921/140737488355329` | `[18]` | 2018.2ms | ❌ FAIL |
| `rad_ext_075` | `sqrt(x + 6) = x - 2` | `x = \frac{5 + \sqrt{33}}{2}` | `x = \frac{5 + \sqrt{33}}{2}` | 1966.3ms | ✅ PASS |


### RATIONAL (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `rat_lin_001` | `(2x + -4)/(x - 4) = 4` | `x = 6` | `x = 6` | 1995.9ms | ✅ PASS |
| `rat_sum_002` | `1/(x - 1) + 2/(x + 1) = 3` | `x = \frac{\sqrt{33}}{6}+\frac{1}{2}, x = -\frac{\sqrt{33}...` | `x = \frac{\sqrt{33}}{6}+\frac{1}{2}, x = -\frac...` | 2079.4ms | ✅ PASS |
| `rat_hole_003` | `(x^2 - 9)/(x - 3) = 6` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2040.0ms | ✅ PASS |
| `rat_lin_004` | `(1x + 4)/(x - 3) = 2` | `x = 10` | `x = 10` | 1979.6ms | ✅ PASS |
| `rat_sum_005` | `1/(x - 1) + 2/(x + 1) = 1` | `x = 0, x = 3` | `x = 0, x = 3` | 2003.8ms | ✅ PASS |
| `rat_hole_006` | `(x^2 - 16)/(x - 4) = 8` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2036.1ms | ✅ PASS |
| `rat_lin_007` | `(2x + -1)/(x - 2) = 5` | `x = 3` | `x = 3` | 2020.7ms | ✅ PASS |
| `rat_sum_008` | `1/(x - 5) + 2/(x + 5) = 1` | `x = -\frac{\sqrt{89}}{2}+\frac{3}{2}, x = \frac{\sqrt{89}...` | `x = -\frac{\sqrt{89}}{2}+\frac{3}{2}, x = \frac...` | 2131.9ms | ✅ PASS |
| `rat_hole_009` | `(x^2 - 1)/(x - 1) = 2` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2056.4ms | ✅ PASS |
| `rat_lin_010` | `(4x + -5)/(x - 3) = 3` | `x = -4` | `x = -4` | 1951.0ms | ✅ PASS |
| `rat_sum_011` | `1/(x - 4) + 2/(x + 4) = 2` | `x = -\frac{\sqrt{233}}{4}+\frac{3}{4}, x = \frac{\sqrt{23...` | `x = -\frac{\sqrt{233}}{4}+\frac{3}{4}, x = \fra...` | 2126.6ms | ✅ PASS |
| `rat_hole_012` | `(x^2 - 9)/(x - 3) = 6` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2015.1ms | ✅ PASS |
| `rat_lin_013` | `(3x + 3)/(x - 4) = 4` | `x = 19` | `x = 19` | 2037.2ms | ✅ PASS |
| `rat_sum_014` | `1/(x - 1) + 2/(x + 1) = 1` | `x = 0, x = 3` | `x = 0, x = 3` | 2035.8ms | ✅ PASS |
| `rat_hole_015` | `(x^2 - 16)/(x - 4) = 8` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2043.7ms | ✅ PASS |
| `rat_lin_016` | `(4x + -2)/(x - 4) = 4` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 2022.1ms | ✅ PASS |
| `rat_sum_017` | `1/(x - 5) + 2/(x + 5) = 1` | `x = -\frac{\sqrt{89}}{2}+\frac{3}{2}, x = \frac{\sqrt{89}...` | `x = -\frac{\sqrt{89}}{2}+\frac{3}{2}, x = \frac...` | 2124.1ms | ✅ PASS |
| `rat_hole_018` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2028.1ms | ✅ PASS |
| `rat_lin_019` | `(1x + 4)/(x - 6) = 4` | `x = \frac{28}{3}` | `x = \frac{28}{3}` | 1977.5ms | ✅ PASS |
| `rat_sum_020` | `1/(x - 4) + 2/(x + 4) = 3` | `x = -\frac{\sqrt{537}}{6}+\frac{1}{2}, x = \frac{\sqrt{53...` | `x = -\frac{\sqrt{537}}{6}+\frac{1}{2}, x = \fra...` | 2188.6ms | ✅ PASS |
| `rat_hole_021` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2013.9ms | ✅ PASS |
| `rat_lin_022` | `(4x + 1)/(x - 4) = 4` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 2001.6ms | ✅ PASS |
| `rat_sum_023` | `1/(x - 2) + 2/(x + 2) = 1` | `x = -\frac{\sqrt{17}}{2}+\frac{3}{2}, x = \frac{\sqrt{17}...` | `x = -\frac{\sqrt{17}}{2}+\frac{3}{2}, x = \frac...` | 2151.5ms | ✅ PASS |
| `rat_hole_024` | `(x^2 - 9)/(x - 3) = 6` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2001.7ms | ✅ PASS |
| `rat_lin_025` | `(4x + -4)/(x - 6) = 3` | `x = -14` | `x = -14` | 1997.5ms | ✅ PASS |
| `rat_sum_026` | `1/(x - 1) + 2/(x + 1) = 1` | `x = 0, x = 3` | `x = 0, x = 3` | 1999.3ms | ✅ PASS |
| `rat_hole_027` | `(x^2 - 16)/(x - 4) = 8` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2003.7ms | ✅ PASS |
| `rat_lin_028` | `(2x + 4)/(x - 3) = 4` | `x = 8` | `x = 8` | 2026.8ms | ✅ PASS |
| `rat_sum_029` | `1/(x - 4) + 2/(x + 4) = 3` | `x = -\frac{\sqrt{537}}{6}+\frac{1}{2}, x = \frac{\sqrt{53...` | `x = -\frac{\sqrt{537}}{6}+\frac{1}{2}, x = \fra...` | 2154.9ms | ✅ PASS |
| `rat_hole_030` | `(x^2 - 9)/(x - 3) = 6` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2030.2ms | ✅ PASS |
| `rat_lin_031` | `(5x + 5)/(x - 6) = 3` | `x = -\frac{23}{2}` | `x = -\frac{23}{2}` | 2078.0ms | ✅ PASS |
| `rat_sum_032` | `1/(x - 2) + 2/(x + 2) = 3` | `x = -\frac{\sqrt{129}}{6}+\frac{1}{2}, x = \frac{\sqrt{12...` | `x = -\frac{\sqrt{129}}{6}+\frac{1}{2}, x = \fra...` | 2169.9ms | ✅ PASS |
| `rat_hole_033` | `(x^2 - 4)/(x - 2) = 4` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2028.3ms | ✅ PASS |
| `rat_lin_034` | `(5x + -5)/(x - 2) = 4` | `x = -3` | `x = -3` | 2063.5ms | ✅ PASS |
| `rat_sum_035` | `1/(x - 3) + 2/(x + 3) = 2` | `x = -\frac{\sqrt{129}}{4}+\frac{3}{4}, x = \frac{\sqrt{12...` | `x = -\frac{\sqrt{129}}{4}+\frac{3}{4}, x = \fra...` | 2190.6ms | ✅ PASS |
| `rat_hole_036` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2058.4ms | ✅ PASS |
| `rat_lin_037` | `(4x + -3)/(x - 3) = 2` | `x = -\frac{3}{2}` | `x = -\frac{3}{2}` | 2057.2ms | ✅ PASS |
| `rat_sum_038` | `1/(x - 2) + 2/(x + 2) = 3` | `x = -\frac{\sqrt{129}}{6}+\frac{1}{2}, x = \frac{\sqrt{12...` | `x = -\frac{\sqrt{129}}{6}+\frac{1}{2}, x = \fra...` | 2114.8ms | ✅ PASS |
| `rat_hole_039` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2026.3ms | ✅ PASS |
| `rat_lin_040` | `(1x + -1)/(x - 3) = 4` | `x = \frac{11}{3}` | `x = \frac{11}{3}` | 2020.2ms | ✅ PASS |
| `rat_sum_041` | `1/(x - 5) + 2/(x + 5) = 3` | `x = -\frac{\sqrt{849}}{6}+\frac{1}{2}, x = \frac{\sqrt{84...` | `x = -\frac{\sqrt{849}}{6}+\frac{1}{2}, x = \fra...` | 2186.9ms | ✅ PASS |
| `rat_hole_042` | `(x^2 - 16)/(x - 4) = 8` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 3659.6ms | ✅ PASS |
| `rat_lin_043` | `(2x + 4)/(x - 2) = 5` | `x = \frac{14}{3}` | `x = \frac{14}{3}` | 2604.5ms | ✅ PASS |
| `rat_sum_044` | `1/(x - 1) + 2/(x + 1) = 2` | `x = \frac{\sqrt{17}}{4}+\frac{3}{4}, x = -\frac{\sqrt{17}...` | `x = \frac{\sqrt{17}}{4}+\frac{3}{4}, x = -\frac...` | 2569.5ms | ✅ PASS |
| `rat_hole_045` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2051.3ms | ✅ PASS |
| `rat_lin_046` | `(1x + -3)/(x - 6) = 3` | `x = \frac{15}{2}` | `x = \frac{15}{2}` | 1017.1ms | ✅ PASS |
| `rat_sum_047` | `1/(x - 1) + 2/(x + 1) = 1` | `x = 0, x = 3` | `x = 0, x = 3` | 1.0ms | ✅ PASS |
| `rat_hole_048` | `(x^2 - 4)/(x - 2) = 4` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 1.0ms | ✅ PASS |
| `rat_lin_049` | `(4x + -2)/(x - 4) = 3` | `x = -10` | `x = -10` | 1146.2ms | ✅ PASS |
| `rat_sum_050` | `1/(x - 5) + 2/(x + 5) = 2` | `x = -\frac{3 \cdot \sqrt{41}}{4}+\frac{3}{4}, x = \frac{3...` | `x = -\frac{3 \cdot \sqrt{41}}{4}+\frac{3}{4}, x...` | 1171.6ms | ✅ PASS |
| `rat_hole_051` | `(x^2 - 9)/(x - 3) = 6` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2115.3ms | ✅ PASS |
| `rat_lin_052` | `(4x + 4)/(x - 6) = 5` | `x = 34` | `x = 34` | 2078.1ms | ✅ PASS |
| `rat_sum_053` | `1/(x - 1) + 2/(x + 1) = 1` | `x = 0, x = 3` | `x = 0, x = 3` | 2058.7ms | ✅ PASS |
| `rat_hole_054` | `(x^2 - 1)/(x - 1) = 2` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 1976.1ms | ✅ PASS |
| `rat_lin_055` | `(2x + -4)/(x - 3) = 3` | `x = 5` | `x = 5` | 2008.0ms | ✅ PASS |
| `rat_sum_056` | `1/(x - 4) + 2/(x + 4) = 1` | `x = -\frac{\sqrt{57}}{2}+\frac{3}{2}, x = \frac{\sqrt{57}...` | `x = -\frac{\sqrt{57}}{2}+\frac{3}{2}, x = \frac...` | 2096.9ms | ✅ PASS |
| `rat_hole_057` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2040.7ms | ✅ PASS |
| `rat_lin_058` | `(3x + 1)/(x - 5) = 2` | `x = -11` | `x = -11` | 1961.9ms | ✅ PASS |
| `rat_sum_059` | `1/(x - 4) + 2/(x + 4) = 2` | `x = -\frac{\sqrt{233}}{4}+\frac{3}{4}, x = \frac{\sqrt{23...` | `x = -\frac{\sqrt{233}}{4}+\frac{3}{4}, x = \fra...` | 2151.8ms | ✅ PASS |
| `rat_hole_060` | `(x^2 - 9)/(x - 3) = 6` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 1961.2ms | ✅ PASS |
| `rat_lin_061` | `(1x + -3)/(x - 6) = 3` | `x = \frac{15}{2}` | `x = \frac{15}{2}` | 2021.1ms | ✅ PASS |
| `rat_sum_062` | `1/(x - 3) + 2/(x + 3) = 3` | `x = -\frac{\sqrt{33}}{2}+\frac{1}{2}, x = \frac{\sqrt{33}...` | `x = -\frac{\sqrt{33}}{2}+\frac{1}{2}, x = \frac...` | 2058.2ms | ✅ PASS |
| `rat_hole_063` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 1991.0ms | ✅ PASS |
| `rat_lin_064` | `(3x + -1)/(x - 2) = 5` | `x = \frac{9}{2}` | `x = \frac{9}{2}` | 2088.8ms | ✅ PASS |
| `rat_sum_065` | `1/(x - 4) + 2/(x + 4) = 3` | `x = -\frac{\sqrt{537}}{6}+\frac{1}{2}, x = \frac{\sqrt{53...` | `x = -\frac{\sqrt{537}}{6}+\frac{1}{2}, x = \fra...` | 2131.1ms | ✅ PASS |
| `rat_hole_066` | `(x^2 - 25)/(x - 5) = 10` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2045.9ms | ✅ PASS |
| `rat_lin_067` | `(3x + -5)/(x - 2) = 2` | `x = 1` | `x = 1` | 2043.2ms | ✅ PASS |
| `rat_sum_068` | `1/(x - 1) + 2/(x + 1) = 3` | `x = \frac{\sqrt{33}}{6}+\frac{1}{2}, x = -\frac{\sqrt{33}...` | `x = \frac{\sqrt{33}}{6}+\frac{1}{2}, x = -\frac...` | 2146.2ms | ✅ PASS |
| `rat_hole_069` | `(x^2 - 1)/(x - 1) = 2` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2020.3ms | ✅ PASS |
| `rat_lin_070` | `(4x + 5)/(x - 5) = 2` | `x = -\frac{15}{2}` | `x = -\frac{15}{2}` | 2003.6ms | ✅ PASS |
| `rat_sum_071` | `1/(x - 2) + 2/(x + 2) = 1` | `x = -\frac{\sqrt{17}}{2}+\frac{3}{2}, x = \frac{\sqrt{17}...` | `x = -\frac{\sqrt{17}}{2}+\frac{3}{2}, x = \frac...` | 2104.0ms | ✅ PASS |
| `rat_hole_072` | `(x^2 - 1)/(x - 1) = 2` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2020.8ms | ✅ PASS |
| `rat_lin_073` | `(2x + 4)/(x - 4) = 2` | `\text{No real solution (inconsistent equation)}` | `\text{No real solution (inconsistent equation)}` | 1969.6ms | ✅ PASS |
| `rat_sum_074` | `1/(x - 1) + 2/(x + 1) = 3` | `x = \frac{\sqrt{33}}{6}+\frac{1}{2}, x = -\frac{\sqrt{33}...` | `x = \frac{\sqrt{33}}{6}+\frac{1}{2}, x = -\frac...` | 2196.4ms | ✅ PASS |
| `rat_hole_075` | `(x^2 - 1)/(x - 1) = 2` | `\text{No real solution} \quad (\text{extraneous root: } x...` | `\text{No real solution} \quad (\text{extraneous...` | 2002.3ms | ✅ PASS |


### SYSTEMS_LINEAR (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `sys_lin_2x2_001` | `['-1*x + -4*y = 29', '-1*x + 2*y = -13']` | `x = -1, \quad y = -7` | `x = -1, \quad y = -7` | 1945.5ms | ✅ PASS |
| `sys_lin_2x2_002` | `['-3*x + 2*y = 20', '3*x + 3*y = 30']` | `x = 0, \quad y = 10` | `x = 0, \quad y = 10` | 1697.7ms | ✅ PASS |
| `sys_lin_2x2_003` | `['3*x + -3*y = 15', '2*x + 3*y = 30']` | `x = 9, \quad y = 4` | `x = 9, \quad y = 4` | 1752.6ms | ✅ PASS |
| `sys_lin_2x2_004` | `['2*x + 3*y = 32', '2*x + -4*y = -24']` | `x = 4, \quad y = 8` | `x = 4, \quad y = 8` | 1787.4ms | ✅ PASS |
| `sys_lin_2x2_005` | `['2*x + 1*y = 4', '4*x + -4*y = -4']` | `x = 1, \quad y = 2` | `x = 1, \quad y = 2` | 1735.5ms | ✅ PASS |
| `sys_lin_2x2_006` | `['4*x + -4*y = -8', '-4*x + 1*y = -1']` | `x = 1, \quad y = 3` | `x = 1, \quad y = 3` | 1656.4ms | ✅ PASS |
| `sys_lin_2x2_007` | `['-4*x + -3*y = -49', '2*x + 3*y = 35']` | `x = 7, \quad y = 7` | `x = 7, \quad y = 7` | 1717.5ms | ✅ PASS |
| `sys_lin_2x2_008` | `['1*x + 1*y = 0', '-4*x + -1*y = 6']` | `x = -2, \quad y = 2` | `x = -2, \quad y = 2` | 1736.9ms | ✅ PASS |
| `sys_lin_2x2_009` | `['-3*x + -1*y = 21', '-2*x + -4*y = 44']` | `x = -4, \quad y = -9` | `x = -4, \quad y = -9` | 1727.9ms | ✅ PASS |
| `sys_lin_2x2_010` | `['4*x + -3*y = -23', '-4*x + 1*y = 5']` | `x = 1, \quad y = 9` | `x = 1, \quad y = 9` | 1785.1ms | ✅ PASS |
| `sys_lin_2x2_011` | `['3*x + -1*y = -11', '-3*x + -3*y = 39']` | `x = -6, \quad y = -7` | `x = -6, \quad y = -7` | 1719.0ms | ✅ PASS |
| `sys_lin_2x2_012` | `['3*x + -4*y = 11', '-2*x + 4*y = -18']` | `x = -7, \quad y = -8` | `x = -7, \quad y = -8` | 1823.7ms | ✅ PASS |
| `sys_lin_2x2_013` | `['1*x + 3*y = -23', '2*x + 4*y = -26']` | `x = 7, \quad y = -10` | `x = 7, \quad y = -10` | 1742.0ms | ✅ PASS |
| `sys_lin_2x2_014` | `['3*x + 1*y = -21', '-2*x + 1*y = -1']` | `x = -4, \quad y = -9` | `x = -4, \quad y = -9` | 1732.9ms | ✅ PASS |
| `sys_lin_2x2_015` | `['-2*x + 3*y = 1', '-4*x + -3*y = -61']` | `x = 10, \quad y = 7` | `x = 10, \quad y = 7` | 1668.3ms | ✅ PASS |
| `sys_lin_2x2_016` | `['3*x + 4*y = 44', '4*x + -2*y = 0']` | `x = 4, \quad y = 8` | `x = 4, \quad y = 8` | 1756.6ms | ✅ PASS |
| `sys_lin_2x2_017` | `['-3*x + -2*y = 32', '3*x + -1*y = -29']` | `x = -10, \quad y = -1` | `x = -10, \quad y = -1` | 1695.4ms | ✅ PASS |
| `sys_lin_2x2_018` | `['-2*x + -1*y = 0', '2*x + -2*y = -12']` | `x = -2, \quad y = 4` | `x = -2, \quad y = 4` | 1709.7ms | ✅ PASS |
| `sys_lin_2x2_019` | `['-3*x + -1*y = 13', '4*x + 3*y = -34']` | `x = -1, \quad y = -10` | `x = -1, \quad y = -10` | 1772.1ms | ✅ PASS |
| `sys_lin_2x2_020` | `['3*x + -3*y = -27', '-4*x + 2*y = 34']` | `x = -8, \quad y = 1` | `x = -8, \quad y = 1` | 1688.6ms | ✅ PASS |
| `sys_lin_2x2_021` | `['1*x + -1*y = 16', '-1*x + 2*y = -24']` | `x = 8, \quad y = -8` | `x = 8, \quad y = -8` | 1771.5ms | ✅ PASS |
| `sys_lin_2x2_022` | `['1*x + -3*y = 22', '-3*x + -1*y = 14']` | `x = -2, \quad y = -8` | `x = -2, \quad y = -8` | 1713.5ms | ✅ PASS |
| `sys_lin_2x2_023` | `['2*x + -2*y = -6', '-2*x + -2*y = -22']` | `x = 4, \quad y = 7` | `x = 4, \quad y = 7` | 1710.5ms | ✅ PASS |
| `sys_lin_2x2_024` | `['1*x + -3*y = -25', '3*x + 1*y = -5']` | `x = -4, \quad y = 7` | `x = -4, \quad y = 7` | 1770.7ms | ✅ PASS |
| `sys_lin_2x2_025` | `['4*x + 2*y = 52', '-1*x + -1*y = -18']` | `x = 8, \quad y = 10` | `x = 8, \quad y = 10` | 1729.7ms | ✅ PASS |
| `sys_lin_2x2_026` | `['4*x + -3*y = -23', '-2*x + 1*y = 11']` | `x = -5, \quad y = 1` | `x = -5, \quad y = 1` | 1742.2ms | ✅ PASS |
| `sys_lin_2x2_027` | `['2*x + -1*y = 23', '1*x + 4*y = -29']` | `x = 7, \quad y = -9` | `x = 7, \quad y = -9` | 1769.5ms | ✅ PASS |
| `sys_lin_2x2_028` | `['1*x + -2*y = 28', '1*x + 4*y = -26']` | `x = 10, \quad y = -9` | `x = 10, \quad y = -9` | 1763.7ms | ✅ PASS |
| `sys_lin_2x2_029` | `['-1*x + 1*y = -9', '-3*x + 1*y = -13']` | `x = 2, \quad y = -7` | `x = 2, \quad y = -7` | 1855.6ms | ✅ PASS |
| `sys_lin_2x2_030` | `['4*x + 2*y = -4', '1*x + 1*y = -5']` | `x = 3, \quad y = -8` | `x = 3, \quad y = -8` | 1695.3ms | ✅ PASS |
| `sys_lin_2x2_031` | `['-3*x + 1*y = 9', '3*x + -3*y = 9']` | `x = -6, \quad y = -9` | `x = -6, \quad y = -9` | 1744.2ms | ✅ PASS |
| `sys_lin_2x2_032` | `['-1*x + -4*y = -36', '-4*x + 2*y = 36']` | `x = -4, \quad y = 10` | `x = -4, \quad y = 10` | 1705.7ms | ✅ PASS |
| `sys_lin_2x2_033` | `['2*x + -3*y = 22', '1*x + 4*y = -44']` | `x = -4, \quad y = -10` | `x = -4, \quad y = -10` | 1718.5ms | ✅ PASS |
| `sys_lin_2x2_034` | `['2*x + -1*y = 9', '-4*x + -3*y = -33']` | `x = 6, \quad y = 3` | `x = 6, \quad y = 3` | 1691.0ms | ✅ PASS |
| `sys_lin_2x2_035` | `['-4*x + 2*y = -14', '2*x + 3*y = 19']` | `x = 5, \quad y = 3` | `x = 5, \quad y = 3` | 1723.3ms | ✅ PASS |
| `sys_lin_2x2_036` | `['2*x + 3*y = 44', '-3*x + -4*y = -61']` | `x = 7, \quad y = 10` | `x = 7, \quad y = 10` | 1771.0ms | ✅ PASS |
| `sys_lin_2x2_037` | `['-4*x + -4*y = -28', '4*x + -2*y = 4']` | `x = 3, \quad y = 4` | `x = 3, \quad y = 4` | 1776.8ms | ✅ PASS |
| `sys_lin_2x2_038` | `['-3*x + 2*y = -11', '-3*x + 1*y = -13']` | `x = 5, \quad y = 2` | `x = 5, \quad y = 2` | 1742.6ms | ✅ PASS |
| `sys_lin_2x2_039` | `['3*x + -1*y = -18', '-1*x + 1*y = 4']` | `x = -7, \quad y = -3` | `x = -7, \quad y = -3` | 1744.3ms | ✅ PASS |
| `sys_lin_2x2_040` | `['-4*x + -3*y = 4', '-4*x + 4*y = 32']` | `x = -4, \quad y = 4` | `x = -4, \quad y = 4` | 1692.8ms | ✅ PASS |
| `sys_lin_2x2_041` | `['3*x + -2*y = 13', '-1*x + 1*y = -6']` | `x = 1, \quad y = -5` | `x = 1, \quad y = -5` | 1778.7ms | ✅ PASS |
| `sys_lin_2x2_042` | `['3*x + 1*y = -16', '3*x + 3*y = -18']` | `x = -5, \quad y = -1` | `x = -5, \quad y = -1` | 1737.0ms | ✅ PASS |
| `sys_lin_2x2_043` | `['-1*x + -3*y = -16', '3*x + 3*y = 30']` | `x = 7, \quad y = 3` | `x = 7, \quad y = 3` | 1716.9ms | ✅ PASS |
| `sys_lin_2x2_044` | `['4*x + 1*y = 0', '2*x + -1*y = 6']` | `x = 1, \quad y = -4` | `x = 1, \quad y = -4` | 1699.9ms | ✅ PASS |
| `sys_lin_2x2_045` | `['-3*x + -1*y = -7', '1*x + -2*y = -14']` | `x = 0, \quad y = 7` | `x = 0, \quad y = 7` | 1811.2ms | ✅ PASS |
| `sys_lin_2x2_046` | `['-2*x + -1*y = 12', '-1*x + 1*y = 12']` | `x = -8, \quad y = 4` | `x = -8, \quad y = 4` | 1769.1ms | ✅ PASS |
| `sys_lin_2x2_047` | `['4*x + 4*y = 48', '-4*x + 1*y = -33']` | `x = 9, \quad y = 3` | `x = 9, \quad y = 3` | 1673.1ms | ✅ PASS |
| `sys_lin_2x2_048` | `['-4*x + 1*y = -4', '4*x + 2*y = -20']` | `x = -1, \quad y = -8` | `x = -1, \quad y = -8` | 1681.6ms | ✅ PASS |
| `sys_lin_2x2_049` | `['3*x + 2*y = -20', '3*x + -3*y = -30']` | `x = -8, \quad y = 2` | `x = -8, \quad y = 2` | 1770.2ms | ✅ PASS |
| `sys_lin_2x2_050` | `['-3*x + -4*y = 29', '-2*x + -1*y = 16']` | `x = -7, \quad y = -2` | `x = -7, \quad y = -2` | 1774.1ms | ✅ PASS |
| `sys_lin_3x3_001` | `['x + y + z = 4', '2*x - y + z = -4', 'x + 2*y - z = 8']` | `x = 0, \quad y = 4, \quad z = 0` | `x = 0, \quad y = 4, \quad z = 0` | 1744.8ms | ✅ PASS |
| `sys_lin_3x3_002` | `['x + y + z = 1', '2*x - y + z = 1', 'x + 2*y - z = -8']` | `x = -2, \quad y = -1, \quad z = 4` | `x = -2, \quad y = -1, \quad z = 4` | 1660.2ms | ✅ PASS |
| `sys_lin_3x3_003` | `['x + y + z = -1', '2*x - y + z = 6', 'x + 2*y - z = 8']` | `x = 5, \quad y = -1, \quad z = -5` | `x = 5, \quad y = -1, \quad z = -5` | 1677.1ms | ✅ PASS |
| `sys_lin_3x3_004` | `['x + y + z = 1', '2*x - y + z = 8', 'x + 2*y - z = 6']` | `x = 5, \quad y = -1, \quad z = -3` | `x = 5, \quad y = -1, \quad z = -3` | 1778.0ms | ✅ PASS |
| `sys_lin_3x3_005` | `['x + y + z = 5', '2*x - y + z = 11', 'x + 2*y - z = 0']` | `x = 4, \quad y = -1, \quad z = 2` | `x = 4, \quad y = -1, \quad z = 2` | 1734.1ms | ✅ PASS |
| `sys_lin_3x3_006` | `['x + y + z = 4', '2*x - y + z = -1', 'x + 2*y - z = 0']` | `x = -1, \quad y = 2, \quad z = 3` | `x = -1, \quad y = 2, \quad z = 3` | 1747.0ms | ✅ PASS |
| `sys_lin_3x3_007` | `['x + y + z = -4', '2*x - y + z = -14', 'x + 2*y - z = 5']` | `x = -4, \quad y = 3, \quad z = -3` | `x = -4, \quad y = 3, \quad z = -3` | 1709.4ms | ✅ PASS |
| `sys_lin_3x3_008` | `['x + y + z = -1', '2*x - y + z = 0', 'x + 2*y - z = -4']` | `x = -1, \quad y = -1, \quad z = 1` | `x = -1, \quad y = -1, \quad z = 1` | 1613.5ms | ✅ PASS |
| `sys_lin_3x3_009` | `['x + y + z = -7', '2*x - y + z = -6', 'x + 2*y - z = -12']` | `x = -5, \quad y = -3, \quad z = 1` | `x = -5, \quad y = -3, \quad z = 1` | 1766.8ms | ✅ PASS |
| `sys_lin_3x3_010` | `['x + y + z = 0', '2*x - y + z = -12', 'x + 2*y - z = 4']` | `x = -4, \quad y = 4, \quad z = 0` | `x = -4, \quad y = 4, \quad z = 0` | 1681.6ms | ✅ PASS |
| `sys_lin_3x3_011` | `['x + y + z = -1', '2*x - y + z = -6', 'x + 2*y - z = 12']` | `x = 1, \quad y = 3, \quad z = -5` | `x = 1, \quad y = 3, \quad z = -5` | 1617.1ms | ✅ PASS |
| `sys_lin_3x3_012` | `['x + y + z = -6', '2*x - y + z = 7', 'x + 2*y - z = -3']` | `x = 3, \quad y = -5, \quad z = -4` | `x = 3, \quad y = -5, \quad z = -4` | 1701.6ms | ✅ PASS |
| `sys_lin_3x3_013` | `['x + y + z = -15', '2*x - y + z = -10', 'x + 2*y - z = -10']` | `x = -5, \quad y = -5, \quad z = -5` | `x = -5, \quad y = -5, \quad z = -5` | 1690.7ms | ✅ PASS |
| `sys_lin_3x3_014` | `['x + y + z = 10', '2*x - y + z = 15', 'x + 2*y - z = 0']` | `x = 5, \quad y = 0, \quad z = 5` | `x = 5, \quad y = 0, \quad z = 5` | 1623.5ms | ✅ PASS |
| `sys_lin_3x3_015` | `['x + y + z = -13', '2*x - y + z = -6', 'x + 2*y - z = -8']` | `x = -3, \quad y = -5, \quad z = -5` | `x = -3, \quad y = -5, \quad z = -5` | 1684.2ms | ✅ PASS |
| `sys_lin_3x3_016` | `['x + y + z = -8', '2*x - y + z = 4', 'x + 2*y - z = -3']` | `x = 2, \quad y = -5, \quad z = -5` | `x = 2, \quad y = -5, \quad z = -5` | 1662.0ms | ✅ PASS |
| `sys_lin_3x3_017` | `['x + y + z = 2', '2*x - y + z = 14', 'x + 2*y - z = -6']` | `x = 4, \quad y = -4, \quad z = 2` | `x = 4, \quad y = -4, \quad z = 2` | 1733.1ms | ✅ PASS |
| `sys_lin_3x3_018` | `['x + y + z = -3', '2*x - y + z = -4', 'x + 2*y - z = -13']` | `x = -5, \quad y = -2, \quad z = 4` | `x = -5, \quad y = -2, \quad z = 4` | 1661.6ms | ✅ PASS |
| `sys_lin_3x3_019` | `['x + y + z = -3', '2*x - y + z = -10', 'x + 2*y - z = 3']` | `x = -3, \quad y = 2, \quad z = -2` | `x = -3, \quad y = 2, \quad z = -2` | 1680.0ms | ✅ PASS |
| `sys_lin_3x3_020` | `['x + y + z = -7', '2*x - y + z = 1', 'x + 2*y - z = -12']` | `x = -2, \quad y = -5, \quad z = 0` | `x = -2, \quad y = -5, \quad z = 0` | 1904.9ms | ✅ PASS |
| `sys_lin_3x3_021` | `['x + y + z = -5', '2*x - y + z = 7', 'x + 2*y - z = -6']` | `x = 2, \quad y = -5, \quad z = -2` | `x = 2, \quad y = -5, \quad z = -2` | 2028.3ms | ✅ PASS |
| `sys_lin_3x3_022` | `['x + y + z = -3', '2*x - y + z = -6', 'x + 2*y - z = -10']` | `x = -5, \quad y = -1, \quad z = 3` | `x = -5, \quad y = -1, \quad z = 3` | 1952.9ms | ✅ PASS |
| `sys_lin_3x3_023` | `['x + y + z = 7', '2*x - y + z = 6', 'x + 2*y - z = 5']` | `x = 3, \quad y = 2, \quad z = 2` | `x = 3, \quad y = 2, \quad z = 2` | 2008.3ms | ✅ PASS |
| `sys_lin_3x3_024` | `['x + y + z = 0', '2*x - y + z = 11', 'x + 2*y - z = -6']` | `x = 3, \quad y = -4, \quad z = 1` | `x = 3, \quad y = -4, \quad z = 1` | 1933.0ms | ✅ PASS |
| `sys_lin_3x3_025` | `['x + y + z = -7', '2*x - y + z = 2', 'x + 2*y - z = -3']` | `x = 1, \quad y = -4, \quad z = -4` | `x = 1, \quad y = -4, \quad z = -4` | 2032.8ms | ✅ PASS |


### SYSTEMS_NONLINEAR (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `sys_nonlin_circ_001` | `['x^2 + y^2 = 169', 'y = x + 1']` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788, 9.6788) \}` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788,...` | 2075.8ms | ✅ PASS |
| `sys_nonlin_circ_002` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 2073.4ms | ✅ PASS |
| `sys_nonlin_circ_003` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2090.7ms | ✅ PASS |
| `sys_nonlin_circ_004` | `['x^2 + y^2 = 169', 'y = x + 1']` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788, 9.6788) \}` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788,...` | 2022.5ms | ✅ PASS |
| `sys_nonlin_circ_005` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2090.1ms | ✅ PASS |
| `sys_nonlin_circ_006` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2114.4ms | ✅ PASS |
| `sys_nonlin_circ_007` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2048.4ms | ✅ PASS |
| `sys_nonlin_circ_008` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2106.0ms | ✅ PASS |
| `sys_nonlin_circ_009` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2056.8ms | ✅ PASS |
| `sys_nonlin_circ_010` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 1968.8ms | ✅ PASS |
| `sys_nonlin_circ_011` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2031.0ms | ✅ PASS |
| `sys_nonlin_circ_012` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2072.9ms | ✅ PASS |
| `sys_nonlin_circ_013` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2118.1ms | ✅ PASS |
| `sys_nonlin_circ_014` | `['x^2 + y^2 = 169', 'y = x + 1']` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788, 9.6788) \}` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788,...` | 2034.3ms | ✅ PASS |
| `sys_nonlin_circ_015` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2067.8ms | ✅ PASS |
| `sys_nonlin_circ_016` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2108.0ms | ✅ PASS |
| `sys_nonlin_circ_017` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2054.8ms | ✅ PASS |
| `sys_nonlin_circ_018` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2047.0ms | ✅ PASS |
| `sys_nonlin_circ_019` | `['x^2 + y^2 = 169', 'y = x + 1']` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788, 9.6788) \}` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788,...` | 2090.5ms | ✅ PASS |
| `sys_nonlin_circ_020` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2014.5ms | ✅ PASS |
| `sys_nonlin_circ_021` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 2131.1ms | ✅ PASS |
| `sys_nonlin_circ_022` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2059.2ms | ✅ PASS |
| `sys_nonlin_circ_023` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 2030.3ms | ✅ PASS |
| `sys_nonlin_circ_024` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2042.0ms | ✅ PASS |
| `sys_nonlin_circ_025` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 2059.1ms | ✅ PASS |
| `sys_nonlin_circ_026` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 2020.7ms | ✅ PASS |
| `sys_nonlin_circ_027` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2023.9ms | ✅ PASS |
| `sys_nonlin_circ_028` | `['x^2 + y^2 = 169', 'y = x + 1']` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788, 9.6788) \}` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788,...` | 2042.4ms | ✅ PASS |
| `sys_nonlin_circ_029` | `['x^2 + y^2 = 169', 'y = x + 1']` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788, 9.6788) \}` | `(x, y) \in \{ (-9.6788, -8.6788),\quad (8.6788,...` | 2037.4ms | ✅ PASS |
| `sys_nonlin_circ_030` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2028.0ms | ✅ PASS |
| `sys_nonlin_circ_031` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2018.8ms | ✅ PASS |
| `sys_nonlin_circ_032` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2070.8ms | ✅ PASS |
| `sys_nonlin_circ_033` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2016.8ms | ✅ PASS |
| `sys_nonlin_circ_034` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2054.7ms | ✅ PASS |
| `sys_nonlin_circ_035` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 2063.2ms | ✅ PASS |
| `sys_nonlin_circ_036` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 1984.6ms | ✅ PASS |
| `sys_nonlin_circ_037` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2036.7ms | ✅ PASS |
| `sys_nonlin_circ_038` | `['x^2 + y^2 = 25', 'y = x + 1']` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | `(x, y) \in \{ (-4, -3),\quad (3, 4) \}` | 2000.4ms | ✅ PASS |
| `sys_nonlin_circ_039` | `['x^2 + y^2 = 100', 'y = x + 1']` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534, 7.5534) \}` | `(x, y) \in \{ (-7.5534, -6.5534),\quad (6.5534,...` | 2040.8ms | ✅ PASS |
| `sys_nonlin_circ_040` | `['x^2 + y^2 = 20', 'y = x + 1']` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225, 3.6225) \}` | `(x, y) \in \{ (-3.6225, -2.6225),\quad (2.6225,...` | 2016.5ms | ✅ PASS |
| `sys_nonlin_parab_001` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 1987.6ms | ✅ PASS |
| `sys_nonlin_parab_002` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2147.0ms | ✅ PASS |
| `sys_nonlin_parab_003` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 2040.3ms | ✅ PASS |
| `sys_nonlin_parab_004` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2074.7ms | ✅ PASS |
| `sys_nonlin_parab_005` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2093.1ms | ✅ PASS |
| `sys_nonlin_parab_006` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2067.8ms | ✅ PASS |
| `sys_nonlin_parab_007` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2083.2ms | ✅ PASS |
| `sys_nonlin_parab_008` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2066.8ms | ✅ PASS |
| `sys_nonlin_parab_009` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2098.5ms | ✅ PASS |
| `sys_nonlin_parab_010` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2099.4ms | ✅ PASS |
| `sys_nonlin_parab_011` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2044.8ms | ✅ PASS |
| `sys_nonlin_parab_012` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2120.8ms | ✅ PASS |
| `sys_nonlin_parab_013` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2052.0ms | ✅ PASS |
| `sys_nonlin_parab_014` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2134.8ms | ✅ PASS |
| `sys_nonlin_parab_015` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2055.5ms | ✅ PASS |
| `sys_nonlin_parab_016` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 1991.2ms | ✅ PASS |
| `sys_nonlin_parab_017` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2048.1ms | ✅ PASS |
| `sys_nonlin_parab_018` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 1965.8ms | ✅ PASS |
| `sys_nonlin_parab_019` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2004.8ms | ✅ PASS |
| `sys_nonlin_parab_020` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2010.5ms | ✅ PASS |
| `sys_nonlin_parab_021` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2074.8ms | ✅ PASS |
| `sys_nonlin_parab_022` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 2078.2ms | ✅ PASS |
| `sys_nonlin_parab_023` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2118.8ms | ✅ PASS |
| `sys_nonlin_parab_024` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2055.7ms | ✅ PASS |
| `sys_nonlin_parab_025` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2068.0ms | ✅ PASS |
| `sys_nonlin_parab_026` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2026.1ms | ✅ PASS |
| `sys_nonlin_parab_027` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 2110.6ms | ✅ PASS |
| `sys_nonlin_parab_028` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 2080.3ms | ✅ PASS |
| `sys_nonlin_parab_029` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 2037.1ms | ✅ PASS |
| `sys_nonlin_parab_030` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 2066.4ms | ✅ PASS |
| `sys_nonlin_parab_031` | `['y = x^2 - 1', 'y = 2*x + 1']` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321, 6.4641) \}` | `(x, y) \in \{ (-0.7321, -0.4641),\quad (2.7321,...` | 2088.2ms | ✅ PASS |
| `sys_nonlin_parab_032` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2060.2ms | ✅ PASS |
| `sys_nonlin_parab_033` | `['y = x^2 - 9', 'y = 2*x + 1']` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166, 9.6332) \}` | `(x, y) \in \{ (-2.3166, -3.6332),\quad (4.3166,...` | 2043.5ms | ✅ PASS |
| `sys_nonlin_parab_034` | `['y = x^2 - 2', 'y = 2*x + 1']` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | `(x, y) \in \{ (-1, -1),\quad (3, 7) \}` | 2053.5ms | ✅ PASS |
| `sys_nonlin_parab_035` | `['y = x^2 - 4', 'y = 2*x + 1']` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, 7.899) \}` | `(x, y) \in \{ (-1.4495, -1.899),\quad (3.4495, ...` | 2065.6ms | ✅ PASS |


### TRIGONOMETRIC (75/75 Passed - 100.0%)

| ID | Problem Input | EasyEquate Generated Solution | Expected (SymPy CAS) | Latency | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `trig_001` | `sin(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1916.1ms | ✅ PASS |
| `trig_002` | `sin(x) = 1` | `x \in \left\{ \frac{\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2} \right\}` | 1986.2ms | ✅ PASS |
| `trig_003` | `sin(x) = -1` | `x \in \left\{ \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{3\pi}{2} \right\}` | 1949.9ms | ✅ PASS |
| `trig_004` | `sin(x) = 1/2` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1920.6ms | ✅ PASS |
| `trig_005` | `cos(x) = 0` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} ...` | 1888.6ms | ✅ PASS |
| `trig_006` | `cos(x) = 1` | `x \in \left\{ 0, \; 2\pi \right\}` | `x \in \left\{ 0, \; 2\pi \right\}` | 1941.6ms | ✅ PASS |
| `trig_007` | `cos(x) = -1` | `x \in \left\{ \pi \right\}` | `x \in \left\{ \pi \right\}` | 1835.5ms | ✅ PASS |
| `trig_008` | `cos(x) = 1/2` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1917.8ms | ✅ PASS |
| `trig_009` | `tan(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1932.0ms | ✅ PASS |
| `trig_010` | `tan(x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1948.7ms | ✅ PASS |
| `trig_011` | `sin(2*x) = 0` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \frac{3\pi}...` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \...` | 1917.9ms | ✅ PASS |
| `trig_012` | `sin(2*x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1962.9ms | ✅ PASS |
| `trig_013` | `cos(2*x) = 0` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4}, \; \frac{...` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4},...` | 1961.4ms | ✅ PASS |
| `trig_014` | `cos(2*x) = 1` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1941.8ms | ✅ PASS |
| `trig_015` | `2*sin(x) = 1` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1915.7ms | ✅ PASS |
| `trig_016` | `2*cos(x) = 1` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1971.7ms | ✅ PASS |
| `trig_017` | `sin(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1906.6ms | ✅ PASS |
| `trig_018` | `sin(x) = 1` | `x \in \left\{ \frac{\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2} \right\}` | 1899.6ms | ✅ PASS |
| `trig_019` | `sin(x) = -1` | `x \in \left\{ \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{3\pi}{2} \right\}` | 1934.3ms | ✅ PASS |
| `trig_020` | `sin(x) = 1/2` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1927.9ms | ✅ PASS |
| `trig_021` | `cos(x) = 0` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} ...` | 1948.9ms | ✅ PASS |
| `trig_022` | `cos(x) = 1` | `x \in \left\{ 0, \; 2\pi \right\}` | `x \in \left\{ 0, \; 2\pi \right\}` | 1886.4ms | ✅ PASS |
| `trig_023` | `cos(x) = -1` | `x \in \left\{ \pi \right\}` | `x \in \left\{ \pi \right\}` | 1871.6ms | ✅ PASS |
| `trig_024` | `cos(x) = 1/2` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1918.2ms | ✅ PASS |
| `trig_025` | `tan(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1858.8ms | ✅ PASS |
| `trig_026` | `tan(x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1876.6ms | ✅ PASS |
| `trig_027` | `sin(2*x) = 0` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \frac{3\pi}...` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \...` | 1916.0ms | ✅ PASS |
| `trig_028` | `sin(2*x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1922.6ms | ✅ PASS |
| `trig_029` | `cos(2*x) = 0` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4}, \; \frac{...` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4},...` | 1978.3ms | ✅ PASS |
| `trig_030` | `cos(2*x) = 1` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1908.9ms | ✅ PASS |
| `trig_031` | `2*sin(x) = 1` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1915.7ms | ✅ PASS |
| `trig_032` | `2*cos(x) = 1` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1938.7ms | ✅ PASS |
| `trig_033` | `sin(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1916.2ms | ✅ PASS |
| `trig_034` | `sin(x) = 1` | `x \in \left\{ \frac{\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2} \right\}` | 2056.0ms | ✅ PASS |
| `trig_035` | `sin(x) = -1` | `x \in \left\{ \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{3\pi}{2} \right\}` | 1959.4ms | ✅ PASS |
| `trig_036` | `sin(x) = 1/2` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1900.1ms | ✅ PASS |
| `trig_037` | `cos(x) = 0` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} ...` | 1902.1ms | ✅ PASS |
| `trig_038` | `cos(x) = 1` | `x \in \left\{ 0, \; 2\pi \right\}` | `x \in \left\{ 0, \; 2\pi \right\}` | 1885.7ms | ✅ PASS |
| `trig_039` | `cos(x) = -1` | `x \in \left\{ \pi \right\}` | `x \in \left\{ \pi \right\}` | 2080.6ms | ✅ PASS |
| `trig_040` | `cos(x) = 1/2` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1939.2ms | ✅ PASS |
| `trig_041` | `tan(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1882.9ms | ✅ PASS |
| `trig_042` | `tan(x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1941.3ms | ✅ PASS |
| `trig_043` | `sin(2*x) = 0` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \frac{3\pi}...` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \...` | 1987.1ms | ✅ PASS |
| `trig_044` | `sin(2*x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1997.5ms | ✅ PASS |
| `trig_045` | `cos(2*x) = 0` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4}, \; \frac{...` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4},...` | 2201.1ms | ✅ PASS |
| `trig_046` | `cos(2*x) = 1` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 2260.7ms | ✅ PASS |
| `trig_047` | `2*sin(x) = 1` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 2045.4ms | ✅ PASS |
| `trig_048` | `2*cos(x) = 1` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1923.5ms | ✅ PASS |
| `trig_049` | `sin(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1874.0ms | ✅ PASS |
| `trig_050` | `sin(x) = 1` | `x \in \left\{ \frac{\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2} \right\}` | 1770.0ms | ✅ PASS |
| `trig_051` | `sin(x) = -1` | `x \in \left\{ \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{3\pi}{2} \right\}` | 1896.4ms | ✅ PASS |
| `trig_052` | `sin(x) = 1/2` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1828.2ms | ✅ PASS |
| `trig_053` | `cos(x) = 0` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} ...` | 1869.8ms | ✅ PASS |
| `trig_054` | `cos(x) = 1` | `x \in \left\{ 0, \; 2\pi \right\}` | `x \in \left\{ 0, \; 2\pi \right\}` | 1789.2ms | ✅ PASS |
| `trig_055` | `cos(x) = -1` | `x \in \left\{ \pi \right\}` | `x \in \left\{ \pi \right\}` | 1943.4ms | ✅ PASS |
| `trig_056` | `cos(x) = 1/2` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1943.2ms | ✅ PASS |
| `trig_057` | `tan(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1996.9ms | ✅ PASS |
| `trig_058` | `tan(x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1983.2ms | ✅ PASS |
| `trig_059` | `sin(2*x) = 0` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \frac{3\pi}...` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \...` | 1872.0ms | ✅ PASS |
| `trig_060` | `sin(2*x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1751.7ms | ✅ PASS |
| `trig_061` | `cos(2*x) = 0` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4}, \; \frac{...` | `x \in \left\{ \frac{\pi}{4}, \; \frac{3\pi}{4},...` | 1961.2ms | ✅ PASS |
| `trig_062` | `cos(2*x) = 1` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1949.1ms | ✅ PASS |
| `trig_063` | `2*sin(x) = 1` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1906.2ms | ✅ PASS |
| `trig_064` | `2*cos(x) = 1` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1943.3ms | ✅ PASS |
| `trig_065` | `sin(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1889.7ms | ✅ PASS |
| `trig_066` | `sin(x) = 1` | `x \in \left\{ \frac{\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2} \right\}` | 1797.5ms | ✅ PASS |
| `trig_067` | `sin(x) = -1` | `x \in \left\{ \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{3\pi}{2} \right\}` | 1732.9ms | ✅ PASS |
| `trig_068` | `sin(x) = 1/2` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} \right\}` | `x \in \left\{ \frac{\pi}{6}, \; \frac{5\pi}{6} ...` | 1741.7ms | ✅ PASS |
| `trig_069` | `cos(x) = 0` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} \right\}` | `x \in \left\{ \frac{\pi}{2}, \; \frac{3\pi}{2} ...` | 1821.8ms | ✅ PASS |
| `trig_070` | `cos(x) = 1` | `x \in \left\{ 0, \; 2\pi \right\}` | `x \in \left\{ 0, \; 2\pi \right\}` | 1700.6ms | ✅ PASS |
| `trig_071` | `cos(x) = -1` | `x \in \left\{ \pi \right\}` | `x \in \left\{ \pi \right\}` | 1746.4ms | ✅ PASS |
| `trig_072` | `cos(x) = 1/2` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} \right\}` | `x \in \left\{ \frac{\pi}{3}, \; \frac{5\pi}{3} ...` | 1918.5ms | ✅ PASS |
| `trig_073` | `tan(x) = 0` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | `x \in \left\{ 0, \; \pi, \; 2\pi \right\}` | 1909.7ms | ✅ PASS |
| `trig_074` | `tan(x) = 1` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} \right\}` | `x \in \left\{ \frac{\pi}{4}, \; \frac{5\pi}{4} ...` | 1994.0ms | ✅ PASS |
| `trig_075` | `sin(2*x) = 0` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \frac{3\pi}...` | `x \in \left\{ 0, \; \frac{\pi}{2}, \; \pi, \; \...` | 1961.0ms | ✅ PASS |

