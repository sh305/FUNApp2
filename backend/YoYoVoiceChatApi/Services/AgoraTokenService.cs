using System.Security.Cryptography;
using System.Text;

namespace YoYoVoiceChatApi.Services
{
    public interface IAgoraTokenService
    {
        string GetAppId();
        string GenerateRtcToken(string channelName, uint uid, int role = 1, int expireSeconds = 86400);
    }

    public class AgoraTokenService : IAgoraTokenService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<AgoraTokenService> _logger;

        public AgoraTokenService(IConfiguration config, ILogger<AgoraTokenService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public string GetAppId()
        {
            return _config["AgoraSettings:AppId"] ?? "YOUR_AGORA_APP_ID";
        }

        public string GenerateRtcToken(string channelName, uint uid, int role = 1, int expireSeconds = 86400)
        {
            var appId = GetAppId();
            var appCertificate = _config["AgoraSettings:AppCertificate"];

            // If no certificate configured (Testing Mode: App ID only), return empty token
            if (string.IsNullOrWhiteSpace(appCertificate) || appCertificate == "YOUR_AGORA_APP_CERTIFICATE")
            {
                _logger.LogInformation("Agora AppCertificate not configured. Returning empty token for AppId testing mode.");
                return string.Empty;
            }

            try
            {
                var expireTimestamp = (uint)(DateTimeOffset.UtcNow.ToUnixTimeSeconds() + expireSeconds);
                return BuildTokenWithUid(appId, appCertificate, channelName, uid, expireTimestamp);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Agora token");
                return string.Empty;
            }
        }

        private static string BuildTokenWithUid(string appId, string appCertificate, string channelName, uint uid, uint expireTimestamp)
        {
            var random = new Random();
            var salt = (uint)random.Next(1, 99999999);
            var issueTs = (uint)DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            // Pack message
            using var ms = new MemoryStream();
            using var bw = new BinaryWriter(ms);

            // Salt
            bw.Write(salt);
            // Issue timestamp
            bw.Write(issueTs);

            // Privileges: 1 = JoinChannel, 2 = PublishAudioStream
            var privileges = new Dictionary<ushort, uint>
            {
                { 1, expireTimestamp },
                { 2, expireTimestamp }
            };

            bw.Write((ushort)privileges.Count);
            foreach (var kvp in privileges)
            {
                bw.Write(kvp.Key);
                bw.Write(kvp.Value);
            }

            var messageBytes = ms.ToArray();

            // Signature = HMAC_SHA256(appCertificate, appId + channelName + uid + messageBytes)
            var uidStr = uid == 0 ? "" : uid.ToString();
            var toSign = new List<byte>();
            toSign.AddRange(Encoding.UTF8.GetBytes(appId));
            toSign.AddRange(Encoding.UTF8.GetBytes(channelName));
            toSign.AddRange(Encoding.UTF8.GetBytes(uidStr));
            toSign.AddRange(messageBytes);

            byte[] signature;
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(appCertificate)))
            {
                signature = hmac.ComputeHash(toSign.ToArray());
            }

            // Pack full token: "006" + appId + base64(signature + messageBytes)
            using var tokenMs = new MemoryStream();
            using var tokenBw = new BinaryWriter(tokenMs);

            tokenBw.Write((ushort)signature.Length);
            tokenBw.Write(signature);
            tokenBw.Write(messageBytes);

            var content = Convert.ToBase64String(tokenMs.ToArray());
            return $"006{appId}{content}";
        }
    }
}
