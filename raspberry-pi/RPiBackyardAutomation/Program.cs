using System;
using Unosquare.RaspberryIO;
using Unosquare.RaspberryIO.Gpio;

namespace RPiBackyardAutomation
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
            try
            {   
                var pin = Pi.Gpio[0];
                pin.PinMode = GpioPinDriveMode.Input;

                while(true)
                {
                    var pinValue = pin.Read();
                    Console.WriteLine($"{pin.Name} = {pinValue}");
                    System.Threading.Thread.Sleep(1000);
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
