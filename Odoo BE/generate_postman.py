import json
import re
from app.main import app

def get_openapi_schema():
    return app.openapi()

def get_mock_value(prop_name, prop_schema, schemas):
    if "example" in prop_schema:
        return prop_schema["example"]
    if "default" in prop_schema:
        return prop_schema["default"]
        
    prop_type = prop_schema.get("type")
    if not prop_type:
        if "$ref" in prop_schema:
            ref_name = prop_schema["$ref"].split("/")[-1]
            return generate_mock_from_schema(schemas.get(ref_name, {}), schemas)
        if "allOf" in prop_schema:
            combined = {}
            for sub in prop_schema["allOf"]:
                val = get_mock_value(prop_name, sub, schemas)
                if isinstance(val, dict):
                    combined.update(val)
                elif val is not None:
                    return val
            return combined
        return None
        
    if prop_type == "string":
        if "email" in prop_name.lower():
            return "user@example.com"
        if "phone" in prop_name.lower():
            return "+1234567890"
        if "password" in prop_name.lower():
            return "password123"
        if prop_schema.get("format") == "date-time":
            return "2026-07-12T12:00:00Z"
        if prop_schema.get("format") == "date":
            return "2026-07-12"
        return "string"
    elif prop_type in ("integer", "number"):
        return 0
    elif prop_type == "boolean":
        return True
    elif prop_type == "array":
        items_schema = prop_schema.get("items", {})
        item_val = get_mock_value(prop_name, items_schema, schemas)
        return [item_val] if item_val is not None else []
    elif prop_type == "object":
        additional_properties = prop_schema.get("additionalProperties")
        if isinstance(additional_properties, dict):
            return {"key": get_mock_value("key", additional_properties, schemas)}
        return {}
    return None

def generate_mock_from_schema(schema, schemas):
    if not schema:
        return None
    if "$ref" in schema:
        ref_name = schema["$ref"].split("/")[-1]
        return generate_mock_from_schema(schemas.get(ref_name, {}), schemas)
    if "properties" in schema:
        mock_obj = {}
        for prop_name, prop_schema in schema["properties"].items():
            mock_obj[prop_name] = get_mock_value(prop_name, prop_schema, schemas)
        return mock_obj
    return None

def openapi_to_postman(openapi):
    title = openapi.get("info", {}).get("title", "Odoo Hackathon API")
    description = openapi.get("info", {}).get("description", "")
    
    postman = {
        "info": {
            "name": title,
            "description": description,
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [],
        "variable": [
            {
                "key": "base_url",
                "value": "http://localhost:8000",
                "type": "string"
            },
            {
                "key": "token",
                "value": "",
                "type": "string"
            }
        ]
    }
    
    schemas = openapi.get("components", {}).get("schemas", {})
    
    # We will group by tags
    folders = {}
    
    paths = openapi.get("paths", {})
    for path, path_item in paths.items():
        for method, operation in path_item.items():
            if method.lower() not in ("get", "post", "put", "delete", "patch"):
                continue
                
            # Name of endpoint
            summary = operation.get("summary") or operation.get("operationId") or f"{method.upper()} {path}"
            op_description = operation.get("description", "")
            tags = operation.get("tags", [])
            tag = tags[0] if tags else "General"
            
            # Postman URL structure
            postman_path = path
            path_variables = []
            
            # Find path parameters (like {id}) and replace with :id
            params_in_path = re.findall(r"\{([^}]+)\}", path)
            for param in params_in_path:
                postman_path = postman_path.replace(f"{{{param}}}", f":{param}")
                path_variables.append({
                    "key": param,
                    "value": f"<{param}>",
                    "description": f"Path parameter: {param}"
                })
            
            # URL components
            url_path_parts = [p for p in postman_path.split("/") if p]
            
            # Query parameters
            query_params = []
            parameters = operation.get("parameters", [])
            for p in parameters:
                if p.get("in") == "query":
                    query_params.append({
                        "key": p.get("name"),
                        "value": p.get("example") or (f"<{p.get('name')}>" if p.get("required") else ""),
                        "description": p.get("description", ""),
                        "disabled": not p.get("required", False)
                    })
                elif p.get("in") == "path":
                    if not any(v["key"] == p.get("name") for v in path_variables):
                        path_variables.append({
                            "key": p.get("name"),
                            "value": f"<{p.get('name')}>",
                            "description": p.get("description", "")
                        })
            
            # Body definition
            body_data = {}
            has_body = False
            request_body = operation.get("requestBody")
            if request_body:
                content = request_body.get("content", {})
                if "application/json" in content:
                    has_body = True
                    schema = content["application/json"].get("schema", {})
                    body_data = generate_mock_from_schema(schema, schemas)
                elif "multipart/form-data" in content:
                    has_body = True
                    schema = content["multipart/form-data"].get("schema", {})
                    form_fields = []
                    if "properties" in schema:
                        for prop_name, prop_schema in schema["properties"].items():
                            form_fields.append({
                                "key": prop_name,
                                "value": prop_schema.get("default", ""),
                                "type": "text" if prop_schema.get("type") != "string" or prop_schema.get("format") != "binary" else "file"
                            })
                    body_data = form_fields
            
            # Headers
            headers = []
            if has_body and not isinstance(body_data, list):
                headers.append({
                    "key": "Content-Type",
                    "value": "application/json"
                })
            
            # Check security / authentication
            # We determine if auth is required based on the endpoint path
            # All endpoints except health, user-login, verify-otp, forgot-password, validate-password, reset-password (wait, reset password does require auth), refresh-token
            is_open = (
                path == "/health" or 
                path == "/send-notification" or 
                path == "/api/v1/users/user-login" or
                path == "/api/v1/users/verify-otp" or
                path == "/api/v1/users/forgot-password" or
                path == "/api/v1/users/validate-password" or
                path == "/api/v1/users/refresh-token"
            )
            
            if not is_open:
                headers.append({
                    "key": "Authorization",
                    "value": "Bearer {{token}}",
                    "description": "Bearer JWT Token for authentication"
                })
                
            pm_request = {
                "name": summary,
                "request": {
                    "method": method.upper(),
                    "header": headers,
                    "url": {
                        "raw": "{{base_url}}" + postman_path,
                        "host": ["{{base_url}}"],
                        "path": url_path_parts
                    },
                    "description": op_description
                }
            }
            
            if path_variables:
                pm_request["request"]["url"]["variable"] = path_variables
            if query_params:
                pm_request["request"]["url"]["query"] = query_params
                # update raw url to include query parameters
                query_str = "&".join(f"{q['key']}={q['value']}" for q in query_params)
                pm_request["request"]["url"]["raw"] = "{{base_url}}" + postman_path + "?" + query_str
                
            if has_body:
                if isinstance(body_data, list):
                    pm_request["request"]["body"] = {
                        "mode": "formdata",
                        "formdata": body_data
                    }
                else:
                    pm_request["request"]["body"] = {
                        "mode": "raw",
                        "raw": json.dumps(body_data, indent=2),
                        "options": {
                            "raw": {
                                "language": "json"
                            }
                        }
                    }
                    
            if tag not in folders:
                folders[tag] = []
            folders[tag].append(pm_request)
            
    for tag, requests in folders.items():
        postman["item"].append({
            "name": tag.capitalize(),
            "item": requests
        })
        
    return postman

if __name__ == "__main__":
    openapi = get_openapi_schema()
    postman_col = openapi_to_postman(openapi)
    
    with open("Odoo_Hackathon_Postman_Collection.json", "w") as f:
        json.dump(postman_col, f, indent=2)
    print("Postman Collection successfully generated!")
