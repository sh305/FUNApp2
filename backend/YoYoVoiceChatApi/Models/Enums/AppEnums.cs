namespace YoYoVoiceChatApi.Models.Enums
{
    public enum AuthProviderType
    {
        Phone,
        Google,
        Facebook,
        Guest
    }

    public enum FrameType
    {
        UserLevel,
        RoomLevel,
        VIP
    }

    public enum ReportDurationType
    {
        ThreeDays,
        SevenDays,
        Permanent
    }

    public enum KickType
    {
        ThreeDays,
        Permanent
    }

    public enum MessageType
    {
        Text,
        GiftAlert,
        SystemNotice
    }
}
