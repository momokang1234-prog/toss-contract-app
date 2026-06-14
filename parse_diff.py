import json

log_path = "/Users/ganghyeon-ug/.gemini/antigravity-ide/brain/0fe8927d-67f5-4154-b9da-d2b9e0bc7a54/.system_generated/logs/transcript.jsonl"
with open(log_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'TOOL_RESPONSE' and 'git diff' in str(data):
            try:
                res = json.loads(data['content'])
                if 'ContractFormPage.tsx' in res.get('output', ''):
                    print("Found git diff!")
                    with open('recover.patch', 'w') as out:
                        out.write(res['output'])
            except:
                pass
