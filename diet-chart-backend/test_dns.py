import time, socket

print("Polling DNS for 60 seconds...")
for i in range(12):
    try:
        ip = socket.gethostbyname('db.nrrmxzlrbijhsiknuxqu.supabase.co')
        print(f"DNS Resolved: {ip}")
        break
    except Exception as e:
        print(f"Attempt {i+1}/12: Failed. Retrying...")
        time.sleep(5)
else:
    print("DNS Failed after 60s")
