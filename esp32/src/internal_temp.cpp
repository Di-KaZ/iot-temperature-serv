#include <Arduino.h>

#include <soc/rtc.h>

#define M1_CALPOINT1_CELSIUS 23.0f
#define M1_CALPOINT1_RAW 128253742.0f
#define M1_CALPOINT2_CELSIUS -20.0f
#define M1_CALPOINT2_RAW 114261758.0f

float readTemp1(bool printRaw = false)
{
  uint64_t value = 0;
  int rounds = 100;

  for (int i = 1; i <= rounds; i++)
  {
    value += rtc_clk_cal_ratio(RTC_CAL_RTC_MUX, 100);
    yield();
  }
  value /= (uint64_t)rounds;

  if (printRaw)
  {
    printf("%s: raw value is: %llu\r\n", __FUNCTION__, value);
  }

  return ((float)value - M1_CALPOINT1_RAW) * (M1_CALPOINT2_CELSIUS - M1_CALPOINT1_CELSIUS) / (M1_CALPOINT2_RAW - M1_CALPOINT1_RAW) + M1_CALPOINT1_CELSIUS;
}

#define M2_CALPOINT1_CELSIUS 23.0f
#define M2_CALPOINT1_RAW 163600.0f
#define M2_CALPOINT2_CELSIUS -20.0f
#define M2_CALPOINT2_RAW 183660.0f

float readTemp2(bool printRaw = false)
{
  uint64_t value = rtc_time_get();
  delay(100);
  value = (rtc_time_get() - value);

  if (printRaw)
  {
    printf("%s: raw value is: %llu\r\n", __FUNCTION__, value);
  }

  return ((float)value * 10.0 - M2_CALPOINT1_RAW) * (M2_CALPOINT2_CELSIUS - M2_CALPOINT1_CELSIUS) / (M2_CALPOINT2_RAW - M2_CALPOINT1_RAW) + M2_CALPOINT1_CELSIUS;
}