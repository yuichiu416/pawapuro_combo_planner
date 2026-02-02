import subprocess
import sys
import os
import re
import time

def get_all_scripts():
    """Finds and sorts all numbered python scripts in the current directory."""
    pattern = re.compile(r'^(\d{2})_.*\.py$')
    scripts = sorted([f for f in os.listdir('.') if pattern.match(f)])
    return scripts

def get_scripts_to_run(all_scripts, args):
    if not args:
        return all_scripts

    only_run = [a for a in args if not a.startswith('-') and a not in ['--list', '-l']]
    skip_run = [a.lstrip('-') for a in args if a.startswith('-')]

    filtered = []
    for s in all_scripts:
        # Match if the prefix is in only_run OR if the script name starts with the arg
        # Example: '1' will match '10_xxx.py' and '11_xxx.py'
        is_targeted = not only_run or any(s.startswith(str(arg)) for arg in only_run)
        
        # Check if it should be skipped
        is_skipped = any(s.startswith(str(skip)) for skip in skip_run)
        
        if is_targeted and not is_skipped:
            filtered.append(s)
    
    return filtered
def run_pipeline():
    # 1. Path Setup
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # 2. Discovery
    all_scripts = get_all_scripts()
    
    # 3. Handle --list / -l command
    if '--list' in sys.argv or '-l' in sys.argv:
        print("\n--- Available Scripts ---")
        for s in all_scripts:
            print(f"  [{s[:2]}] {s}")
        print("--------------------------")
        print("Usage: python runner.py 01 02 (Run specific)")
        print("       python runner.py -05 -06 (Skip specific)\n")
        return

    # 4. Filter scripts
    scripts_to_execute = get_scripts_to_run(all_scripts, sys.argv[1:])
    
    if not scripts_to_execute:
        print("No scripts matched your filter or folder is empty.")
        return

    results = []
    pipeline_start = time.time()

    print(f"--- Pipeline Root: {script_dir} ---")
    print(f"--- Planned: {len(scripts_to_execute)} / Total: {len(all_scripts)} ---")
    
    for script_name in scripts_to_execute:
        print(f"\n▶️  STARTING: {script_name}")
        start_tick = time.time()
        
        try:
            # check=True raises CalledProcessError on non-zero exit
            subprocess.run([sys.executable, script_name], check=True)
            status = "PASS"
        except subprocess.CalledProcessError:
            status = "FAIL"
        except Exception as e:
            print(f"Unexpected Error: {e}")
            status = "ERROR"
        
        duration = time.time() - start_tick
        results.append({"name": script_name, "status": status, "time": f"{duration:.2f}s"})

        if status != "PASS":
            print(f"\n❌ {script_name} halted the pipeline.")
            break

    # --- Summary Report ---
    print("\n" + "="*50)
    print(f"{'PIPELINE SUMMARY':^50}")
    print("="*50)
    for res in results:
        icon = "✅" if res['status'] == "PASS" else "❌"
        print(f"{icon} {res['name']:<35} {res['status']:<7} [{res['time']}]")
    
    total_time = time.time() - pipeline_start
    print("="*50)
    print(f"Total Time: {total_time:.2f}s\n")

if __name__ == "__main__":
    run_pipeline()