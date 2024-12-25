import requests
import base64

# Spotify Credentials
CLIENT_ID = 'your_client_id'
CLIENT_SECRET = 'your_client_secret'

def get_access_token(client_id, client_secret):
    auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    headers = {
        'Authorization': f'Basic {auth_header}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    data = {'grant_type': 'client_credentials'}
    response = requests.post('https://accounts.spotify.com/api/token', headers=headers, data=data)
    return response.json().get('access_token')
w
def get_top_charts(access_token, country):
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'q': f'Top 50 {country}', 'type': 'playlist', 'limit': 1}
    response = requests.get('https://api.spotify.com/v1/search', headers=headers, params=params)
    return response.json()

def get_playlist_tracks(access_token, playlist_id):
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks', headers=headers)
    return response.json()

# Main Script
if __name__ == "__main__":
    access_token = 'BQCe2XJnC55xhZ1lpcy9I-VOio9DpwsP74BogUjMwb4mKTWtIB15K3ueJIyssVsptq6L6sqiYO-y81krIp1tuU6eX-dmwNRnH9zy-F3w8TDn8y6deUQ'
    country = "United States"
    playlist_data = get_top_charts(access_token, country)
    playlist_id = playlist_data['playlists']['items'][0]['id']
    tracks = get_playlist_tracks(access_token, playlist_id)
    
    for track in tracks['items']:
        print(f"{track['track']['name']} by {', '.join(artist['name'] for artist in track['track']['artists'])}")
