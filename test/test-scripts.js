// Test Scripts with Intentional Errors for Claude to Fix

const testScripts = {
  // Python scripts with various errors
  python: {
    syntaxError: {
      broken: `def calculate_average(numbers)
    total = 0
    for num in numbers
        total += num
    return total / len(numbers)`,
      
      expectedFix: `def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers) if numbers else 0`
    },
    
    noErrorHandling: {
      broken: `import json
import requests

def fetch_data(url):
    response = requests.get(url)
    data = json.loads(response.text)
    return data['results']`,
      
      expectedFix: `import json
import requests

def fetch_data(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get('results', [])
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return []
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error parsing data: {e}")
        return []`
    }
  },

  // Bash scripts with various errors
  bash: {
    quotingError: {
      broken: `#!/bin/bash
SOURCE_DIR=/home/user/my documents
DEST_DIR=/backup

for file in $(ls $SOURCE_DIR/*.txt); do
    cp $file $DEST_DIR
done`,
      
      expectedFix: `#!/bin/bash
SOURCE_DIR="/home/user/my documents"
DEST_DIR="/backup"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory does not exist"
    exit 1
fi

if [ ! -d "$DEST_DIR" ]; then
    echo "Error: Destination directory does not exist"
    exit 1
fi

for file in "$SOURCE_DIR"/*.txt; do
    if [ -f "$file" ]; then
        cp "$file" "$DEST_DIR" || echo "Failed to copy: $file"
    fi
done`
    },
    
    noErrorCheck: {
      broken: `#!/bin/bash
cd /app
git pull origin main
npm install
npm run build
systemctl restart app`,
      
      expectedFix: `#!/bin/bash
set -e

# Navigate to app directory
cd /app || { echo "Failed to change directory to /app"; exit 1; }

# Pull latest changes
git pull origin main || { echo "Failed to pull from git"; exit 1; }

# Install dependencies
npm install || { echo "Failed to install dependencies"; exit 1; }

# Build application
npm run build || { echo "Failed to build application"; exit 1; }

# Restart service
systemctl restart app || { echo "Failed to restart application"; exit 1; }

echo "Deployment completed successfully"`
    }
  },

  // SQL with errors
  sql: {
    syntaxError: {
      broken: `SELECT user.name, COUNT(*) as order_count
FORM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01'
GROUP BY u.id`,
      
      expectedFix: `SELECT u.name, COUNT(*) as order_count
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01'
GROUP BY u.id, u.name`
    }
  },

  // Docker/YAML with errors
  docker: {
    indentationError: {
      broken: `version: '3'
services:
  web:
  image: nginx:latest
    ports:
    - "80:80"
  volumes:
    - ./html:/usr/share/nginx/html`,
      
      expectedFix: `version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: unless-stopped`
    }
  },

  // JavaScript with errors
  javascript: {
    asyncError: {
      broken: `async function fetchUserData(userId) {
    const user = await fetch('/api/users/' + userId);
    const posts = await fetch('/api/posts?user=' + userId);
    
    return {
        user: user.json(),
        posts: posts.json()
    };
}`,
      
      expectedFix: `async function fetchUserData(userId) {
    try {
        const [userResponse, postsResponse] = await Promise.all([
            fetch('/api/users/' + userId),
            fetch('/api/posts?user=' + userId)
        ]);
        
        if (!userResponse.ok || !postsResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const [user, posts] = await Promise.all([
            userResponse.json(),
            postsResponse.json()
        ]);
        
        return {
            user,
            posts
        };
    } catch (error) {
        console.error('Error fetching user data:', error);
        return {
            user: null,
            posts: []
        };
    }
}`
    }
  }
};

// Simulated error outputs for each script type
const errorOutputs = {
  python: {
    syntaxError: `  File "script.py", line 3
    for num in numbers
                      ^
SyntaxError: invalid syntax`,
    
    noErrorHandling: `Traceback (most recent call last):
  File "script.py", line 7, in <module>
    data = fetch_data("http://api.example.com/data")
  File "script.py", line 5, in fetch_data
    response = requests.get(url)
requests.exceptions.ConnectionError: Failed to establish a new connection`
  },
  
  bash: {
    quotingError: `ls: cannot access '/home/user/my': No such file or directory
ls: cannot access 'documents/*.txt': No such file or directory
cp: missing destination file operand after 'documents'`,
    
    noErrorCheck: `fatal: not a git repository (or any of the parent directories): .git
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /app/package.json
npm ERR! errno -2`
  },
  
  sql: {
    syntaxError: `ERROR:  syntax error at or near "FORM"
LINE 2: FORM users u
        ^
ERROR:  column "u.name" must appear in the GROUP BY clause or be used in an aggregate function`
  },
  
  docker: {
    indentationError: `ERROR: yaml.scanner.ScannerError: while parsing a block mapping
  in "./docker-compose.yml", line 3, column 3
expected <block end>, but found '<block mapping start>'
  in "./docker-compose.yml", line 4, column 3`
  },
  
  javascript: {
    asyncError: `TypeError: user.json is not a function
    at fetchUserData (script.js:6:15)
    at async main (script.js:10:20)
UnhandledPromiseRejectionWarning: Unhandled promise rejection`
  }
};

// Function to populate test page with a specific scenario
function loadTestCase(scriptType, errorType) {
  const script = testScripts[scriptType][errorType];
  const output = errorOutputs[scriptType][errorType];
  
  // Find the first available input/output pair
  const outputElements = document.querySelectorAll('.terminal, .output, .console, .terminal-output');
  const inputElements = document.querySelectorAll('.command-input, .terminal-input, textarea');
  
  if (outputElements.length > 0 && inputElements.length > 0) {
    outputElements[0].textContent = output;
    inputElements[0].value = script.broken;
    
    // Add visual indicator
    outputElements[0].style.border = '2px solid #ff6b6b';
    inputElements[0].style.border = '2px solid #ffd93d';
    
    console.log(`Loaded test case: ${scriptType}/${errorType}`);
    console.log('Expected Claude to fix the script to something like:', script.expectedFix);
  }
}

// Export for use in HTML page
if (typeof window !== 'undefined') {
  window.testScripts = testScripts;
  window.errorOutputs = errorOutputs;
  window.loadTestCase = loadTestCase;
}