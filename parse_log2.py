import json

log_path = "/Users/ganghyeon-ug/.gemini/antigravity-ide/brain/0fe8927d-67f5-4154-b9da-d2b9e0bc7a54/.system_generated/logs/transcript.jsonl"
with open(log_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if 'tool_calls' in data:
            for tc in data['tool_calls']:
                if tc['name'] == 'write_to_file' and 'ContractFormPage.tsx' in tc['args'].get('TargetFile', ''):
                    # Save the latest CodeContent to a file
                    content = tc['args']['CodeContent']
                    with open('ContractFormPage_restored.tsx', 'w') as out:
                        out.write(content)
