using Microsoft.Extensions.Caching.Memory;

namespace YoYoVoiceChatApi.Services
{
    public interface ICacheService
    {
        T? Get<T>(string key);
        void Set<T>(string key, T value, TimeSpan? expiration = null);
        void Remove(string key);
        bool IsUserBlocked(int blockerId, int targetUserId);
        void SetUserBlocked(int blockerId, int targetUserId, bool isBlocked);
    }

    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;

        public CacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public T? Get<T>(string key)
        {
            return _memoryCache.TryGetValue(key, out T? value) ? value : default;
        }

        public void Set<T>(string key, T value, TimeSpan? expiration = null)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(30)
            };
            _memoryCache.Set(key, value, options);
        }

        public void Remove(string key)
        {
            _memoryCache.Remove(key);
        }

        public bool IsUserBlocked(int blockerId, int targetUserId)
        {
            var key = $"block_{blockerId}_{targetUserId}";
            return _memoryCache.TryGetValue(key, out bool blocked) && blocked;
        }

        public void SetUserBlocked(int blockerId, int targetUserId, bool isBlocked)
        {
            var key = $"block_{blockerId}_{targetUserId}";
            if (isBlocked)
            {
                Set(key, true, TimeSpan.FromHours(2));
            }
            else
            {
                Remove(key);
            }
        }
    }
}
