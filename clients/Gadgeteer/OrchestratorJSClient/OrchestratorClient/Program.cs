using System;
using System.Collections;
using System.Threading;
using Microsoft.SPOT;
using Microsoft.SPOT.Presentation;
using Microsoft.SPOT.Presentation.Controls;
using Microsoft.SPOT.Presentation.Media;
using Microsoft.SPOT.Touch;

using Gadgeteer.Networking;
using GT = Gadgeteer;
using GTM = Gadgeteer.Modules;
using SocketIO.NetMF;

namespace OrchestratorClient
{
    struct Settings {
        string host;
        string port;
        
        // identity of the client in orchestrator.js server
        string clientIdentity;
    }


    class OrchestratorSocketIOClient : SocketIOClient 
    {
        private string clientIdentity_;
        public OrchestratorSocketIOClient(string clienIdentity) 
        {
            clientIdentity_ = clienIdentity;
        }


        override public void onConnect()
        {
            Debug.Print("SocketIO connected");
            emit("login", new ArrayList() { clientIdentity_ });
        }

        // handle your own specified event types here
        override public void onEvent(string name, ArrayList args)
        {
            Debug.Print("got event: " + name);
        }


        // other reserved messages and event types
        override public void onDisconnect() { Debug.Print("disconnected"); }
        override public void onHeartbeat() { Debug.Print("got heartbeat"); }
        override public void onMessage(string message) { Debug.Print("got message: " + message); }
        override public void onJsonMessage(Hashtable jsonObject) { Debug.Print("got json obj"); }

        // Handle error cases
        override public void onError(string reason) { throw new Exception(reason); }


    
    }

    public partial class Program
    {
        private static string wlanName_ = "peltomaa";
        private static string wlanPassword_ = "socialdevices";

        private static string host = "192.168.0.13";
        private static string port = "8080";


        private static string clientIdentity = "nikkis@gadgeteer";




        // This method is run when the mainboard is powered up or reset.   
        void ProgramStarted()
        {
            


            // initialize the wifi connection
            GeneralHelpers.initWifiConnection(wifi_RS21, wlanName_, wlanPassword_);

            OrchestratorSocketIOClient orchestratorClient = new OrchestratorSocketIOClient(clientIdentity);

            button.ButtonPressed += new GTM.GHIElectronics.Button.ButtonEventHandler((s, e) => {
                // initialize the socketio connection
                orchestratorClient.connect(host, port);
            });


            // Use Debug.Print to show messages in Visual Studio's "Output" window during debugging.
            Debug.Print("Program Started");
        }

    }
}
