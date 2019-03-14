#include <Devuino.h>
#include <Adafruit_NeoPixel.h>

const volatile char creator[] = "Charlie Habolin 8 februari 2019";

Adafruit_NeoPixel pixelring = Adafruit_NeoPixel(24, 10);

const int tonePin = 8;
const int playercount = 5;
int points[playercount] = {0, 0, 0, 0, 0};
Button<Onboard> players[playercount] = {
  Button<Onboard>(Onboard(15), pin::Resistor::PullUp),
  Button<Onboard>(Onboard(12), pin::Resistor::PullUp),
  Button<Onboard>(Onboard(14), pin::Resistor::PullUp),
  Button<Onboard>(Onboard(3), pin::Resistor::PullUp),
  Button<Onboard>(Onboard(2), pin::Resistor::PullUp)
};
uint32_t playercolor[playercount] = {
  pixelring.Color(0x0, 0x0, 0xff),
  pixelring.Color(0xff, 0xff, 0xff),
  pixelring.Color(0xff, 0x0, 0x0),
  pixelring.Color(0xff, 0xff, 0x0),
  pixelring.Color(0x0, 0xff, 0x0)
};

// Return pressed index, if none pressed return -1
int pressed(bool wait)
{
  do
  {
    for (int index = 0; index < playercount; index++)
    {
      if (!players[index].value())
      {
        return index;
      }
    }
  } while (wait);
  return -1;
};

void setup()
{
  randomSeed(analogRead(A5));
  Serial.begin(9600);
  pixelring.begin();
  pixelring.setBrightness(20);
  pixelring.show();

  while (pressed(false) == -1)
  {
    chase(pixelring.Color(0x55, 0x1a, 0x8b), 80, 5);
  }
  solid(pixelring.Color(0x0, 0x0, 0x0));
  delay(3000);
}

void loop()
{
  int prepressed;

  if (countdown(prepressed))
  {
    noTone(tonePin);
    solid(pixelring.Color(0x0, 0x0, 0x0));

    int winner = pressed(true);

    solid(playercolor[winner]);
    tone(tonePin, 700);
    delay(300);
    noTone(tonePin);
    delay(50);
    tone(tonePin, 700);
    delay(300);
    noTone(tonePin);
    delay(50);
    tone(tonePin, 1000);
    delay(500);
    noTone(tonePin);

    chase(playercolor[winner], 80, 15);
    solid(pixelring.Color(0x0, 0x0, 0x0));
    delay(400);

    pointDisplay(true, winner);

    for (int counter = 0; counter < playercount; counter++)
    {
      if (points[counter] == 4)
      {
        tone(tonePin, 700);
        delay(300);
        noTone(tonePin);
        delay(50);
        tone(tonePin, 700);
        delay(300);
        noTone(tonePin);
        delay(50);
        tone(tonePin, 1100);
        delay(500);
        noTone(tonePin);
        while (true)
        {
          chase(playercolor[counter], 80, 70);
        }
      }
    }

    // Continue game
    solid(pixelring.Color(0x0, 0x0, 0x0));
    delay(1500);
  }
  else
  {
    // Button pressed before stop, remove point from player

    for (int counter = 0; counter < 2; counter++)
    {
      tone(tonePin, 600);
      delay(400);
      noTone(tonePin);
      chase(playercolor[prepressed], 1, 70);

      tone(tonePin, 600);
      delay(200);
      noTone(tonePin);
      chase(pixelring.Color(0xff, 0x0, 0x0), 1, 70);
    }

    solid(pixelring.Color(0x0, 0x0, 0x0));
    noTone(tonePin);
    delay(1000);

    pointDisplay(false, prepressed);
  }
}

bool countdown(int& prepressed)
{
  int pitchMin = 400;
  int loopMax = random(2, 11);
  int pitchMax = random(1900, 3000);
  int stopP = random(pitchMin, pitchMax);

  unsigned long previoustime = 0;
  long delaytime = 0;

  for (int loops = 1; loops <= loopMax; loops++)
  {
    for (int pitch = pitchMax; pitch > pitchMin; pitch = pitch - 200)
    {
      noTone(tonePin);
      glitter(0.04);
      tone(tonePin, pitch);

      delaytime = 256 - (35 + (20 * loops));
      unsigned long previoustime = millis();
      unsigned long currenttime = previoustime;
      while (currenttime - previoustime < delaytime)
      {
        currenttime = millis();

        if (loops == loopMax && pitch <= stopP)
        {
          // The countdown is ended and none pressed before
          return true;
        }

        prepressed = pressed(false);
        if (prepressed != -1)
        {
          // Someone cheated
          return false;
        }
      }

    }
  }
}

void pointDisplay(bool addPoints, int player)
{
  if (addPoints)
  {
    points[player] += 1;
  }
  else
  {
    points[player] -= 1;
  }
  solid(pixelring.Color(0x0, 0x0, 0x0));


  // Blue
  int topblue = 3;
  for (int counter = 23; (counter % 23 ) <= 3; counter++)
  {
    if (points[0] > topblue - (counter % 23))
    {
      pixelring.setPixelColor(counter % 24, playercolor[0]);
    }
    else
    {
      pixelring.setPixelColor(counter % 24, pixelring.Color(0x10, 0x10, 0x10));
    }
  }

  // White
  int topwhite = 7;
  for (int counter = 4; counter <= 7; counter++)
  {
    if (points[1] > topwhite - counter)
    {
      pixelring.setPixelColor(counter, playercolor[1]);
    }
    else
    {
      pixelring.setPixelColor(counter, pixelring.Color(0x10, 0x10, 0x10));
    }
  }

  // Red
  int topred = 12;
  for (int counter = 9; counter <= 12; counter++)
  {
    if (points[2] > topred - counter)
    {
      pixelring.setPixelColor(counter, playercolor[2]);
    }
    else
    {
      pixelring.setPixelColor(counter, pixelring.Color(0x10, 0x10, 0x10));
    }
  }

  // Yellow
  int topyellow = 17;
  for (int counter = 14; counter <= 17; counter++)
  {
    if (points[3] > topyellow - counter)
    {
      pixelring.setPixelColor(counter, playercolor[3]);
    }
    else
    {
      pixelring.setPixelColor(counter, pixelring.Color(0x10, 0x10, 0x10));
    }
  }

  // Green
  int topgreen = 22;
  for (int counter = 19; counter <= 22; counter++)
  {
    if (points[4] > topgreen - counter)
    {
      pixelring.setPixelColor(counter, playercolor[4]);
    }
    else
    {
      pixelring.setPixelColor(counter, pixelring.Color(0x10, 0x10, 0x10));
    }
  }

  pixelring.show();

  delay(4000);
}

void chase(uint32_t color, uint8_t wait, int rounds)
{
  for (int cycle = 0; cycle < rounds; cycle++)
  {
    for (int step = 0; step < 3; step++)
    {
      for (uint16_t counter = 0; counter < pixelring.numPixels(); counter = counter + 3)
      {
        pixelring.setPixelColor(counter + step, color); // Turn every third pixel on
      }

      pixelring.show();
      delay(wait);

      for (uint16_t counter = 0; counter < pixelring.numPixels(); counter = counter + 3)
      {
        pixelring.setPixelColor(counter + step, 0); // Turn every third pixel off
      }
    }
  }
}

void solid(uint32_t color)
{
  for (int counter = 0; counter < pixelring.numPixels(); counter++)
  {
    pixelring.setPixelColor(counter, color);
  }
  pixelring.show();
}

float pos = 0.0;
void glitter(float rate)
{
  // cycle through x times
  for (int x = 0; x < 24; x++)
  {
    pos = pos + rate;
    for (int i = 0; i < pixelring.numPixels(); i++)
    {
      // sine wave, 3 offset waves make a rainbow!
      float level1 = sin(i + pos) * 127 + 128;
      float level2 = sin(i + pos) * 127 + 180;
      float level3 = sin(i + pos) * 127 + 64;
      // set color level
      pixelring.setPixelColor(i, (int)level1, (int)level2, (int)level3);
    }
    pixelring.show();
  }
}
