from datetime import datetime, timezone
import json
import urllib
import asyncio
import requests
import dateutil.parser
import websockets


access_token = 'w/c1LZHNnNBnYFx4q6cdil7qCutjERnWXqsDl7+vbd3dDiw8ZDkypmg7tnhotae9XL+eey1UL+1IA36OktytKKu+SqVfngksWoiZz6gf5ur2X8Ar/ecWFk33XXrg+hc+g3BoxSOYvuBDF31cRkaXPeQ5yvENIM/28pdNOmZ8SPFSJl3IofNzgmultl03kinOmo87q977iugseamqEWpsmPXUOcOm97h2CIQ4ju/gVHbjuj4jI6xtEXktiuEA5Q+zRmYCbmWGPDRtBa9bTG1C/QvY2X3ac26bpjpeNC1O80Np2hdnGpxaKhvqH/T3519Y92NYNz8YCRROsutsZUZt8cecjo27pLYtE3e+siwlZMfvKJnQEbaA/u4uB9TiglduXrMSeWAmKOYLwN5AYxa2KcukyHqggNGqfXQWvFaOByPEfZaFCUkGlYUv9EliEsEDHK3aZlVOhPzVhRIYJl5iLWWbva07NNE7bzsxYjbTmROYWYRvM0831oLTRZkhk1lUtUbOkH7Eo0MEOm7X14ag8mr9FYOuq2q0CVU7LUOMgDEO8fyAy1Mitk6O32z100MQuG4LYrgoVi/JHHvlYF9rSax7UYx5puB0QRnd6COuLbre1I1hjIUFPKltMmkIaPfLZbydXRueWUah1EYJwmV1l3xv0sNIFXb1qmjJqqi/SMwKoy9tfZAC0/YzcoCaaAqtGNmcbrlBi9ykBpLTb3EnODslKcvFbmZ1twC0/ykcy6GJlvsrswGfl2PK24aIPQsi3z4k7zrJigWcBe4W6fGKgq/PUgkeYXB08R/mIu8ofXn4M+t2zXQ7G5jhnY1JL4SJGKpNMsfSw6kYOT+2T90UjnbAcO6DTq3HAbZbc2r/M9TnY6tYkcGgbsxhYkSIW3bzNsj+Ai/1iZpknLMB2K2eYgjC4EIBL263tabRLSlKivXdAvXfqajyMSNE8rmAbxYcsZ9B9pmCo1oQoqs9vvPVcpDKpEj+tKPHv+LcXZnYvZb9qVrwqKAv3cfkfvPjmMqw8uKMP7ppZEAvNH5t0aZyTuz4NT67Nj89W5ns+IJL4+BmytDOnCKWQWAl8ELm4G07G1vQ9uWesDE4kRCARK0qbGDxJYRKRpCfBPLh4JD+F7mEpjmHs2B2iCKKybW09tHwQlmdDKvfqVQ=212FD3x19z9sWBHDJACbC00B75E'
endpoint = 'https://api.tdameritrade.com/v1'


async def connect_ws(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    params = {
        'fields': 'streamerSubscriptionKeys,streamerConnectionInfo'
    }
    resp = requests.get(url=f'{endpoint}/userprincipals', params=params, headers=headers).json()

    token_ts = resp['streamerInfo']['tokenTimestamp']
    date = dateutil.parser.isoparse(token_ts)
    creds = {
        'userid': resp['accounts'][0]['accountId'],
        'token': resp['streamerInfo']['token'],
        'company': resp['accounts'][0]['company'],
        'segment': resp['accounts'][0]['segment'],
        'cddomain': resp['accounts'][0]['accountCdDomainId'],
        'usergroup': resp['streamerInfo']['userGroup'],
        'accesslevel': resp['streamerInfo']['accessLevel'],
        'authorized': 'Y',
        'timestamp': int(to_millis(date)),
        'appid': resp['streamerInfo']['appId'],
        'acl': resp['streamerInfo']['acl'],
    }

    login_req = {
        'requests': [
            {
                'requestid': 0,
                'account': resp['accounts'][0]['accountId'],
                'source': resp['streamerInfo']['appId'],
                'service': 'ADMIN',
                'command': 'LOGIN',
                'parameters': {
                    'credential': urllib.parse.urlencode(creds),
                    'token': resp['streamerInfo']['token'],
                    'version': '1.0',
                }
            }
        ]
    }

    data_req = {
        'requests': [
            {
                "requestid": 1,
                'account': resp['accounts'][0]['accountId'],
                'source': resp['streamerInfo']['appId'],
                'service': 'OPTION',
                'command': 'SUBS',
                'parameter': {
                    'keys': 'TSLA',
                    'fields': '0,2,3,4,20,21,24,29,32,33,34,39',
                },
            },
        ]
    }

    ws_url = f"wss://{resp['streamerInfo']['streamerSocketUrl']}/ws"
    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps(login_req))
        login_resp = await ws.recv()
        print('login resp', login_resp)
        print('send data', await ws.send(json.dumps(data_req)))
        while True:
            try:
                data_resp = await ws.recv()
                print(login_resp)
            except:
                break


def to_millis(dt):
    return dt.timestamp() * 1000

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(connect_ws(access_token))
    asyncio.get_event_loop().run_forever()
