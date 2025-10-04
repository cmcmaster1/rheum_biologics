import datetime
from datasets import Dataset, load_dataset
from huggingface_hub import HfApi
import argparse
import os

class PBSDatasetClient:
    def __init__(self, base_repo_id='cmcmaster/pbs'):
        self.base_repo_id = base_repo_id
        
    def _get_dataset_name(self, table_name):
        """Convert table name to dataset name format used by main.py"""
        return f"{self.base_repo_id}_{table_name.replace('-', '_')}"
    
    def _load_dataset_as_dict_list(self, table_name, config_name=None):
        """Load a dataset and return it as a list of dictionaries"""
        dataset_name = self._get_dataset_name(table_name)
        try:
            if config_name:
                dataset = load_dataset(dataset_name, config_name)['train']
            else:
                # Try to get the latest available config if none specified
                dataset_info = load_dataset(dataset_name, streaming=False)
                # Get the first available split
                dataset = next(iter(dataset_info.values()))
            
            return dataset.to_pandas().to_dict('records')
        except Exception as e:
            print(f"Error loading dataset {dataset_name}: {e}")
            return []

    def get_sample_data(self, endpoint, limit=5):
        """Get sample data from a dataset (for compatibility)"""
        data = self._load_dataset_as_dict_list(endpoint)
        return data[:limit] if data else []

    def fetch_sample_data(self):
        """Fetch sample data from all relevant datasets"""
        endpoints = [
            "amt-items",
            "atc-codes", 
            "indications",
            "prescribing-texts",
            "item-prescribing-text-relationships",
            "restrictions",
            "item-restriction-relationships"
        ]

        sample_data = {}
        for endpoint in endpoints:
            print(f"Fetching sample data from {endpoint} dataset...")
            data = self.get_sample_data(endpoint)
            if data:
                sample_data[endpoint] = data
                print(f"Sample keys for {endpoint}: {list(data[0].keys())}")
            else:
                print(f"No data found for {endpoint}")

        return sample_data

    def _get_latest_config_name(self, dataset_name):
        """Get the latest config name (YYYY-MM format) from a dataset"""
        try:
            api = HfApi()
            dataset_info = api.dataset_info(dataset_name)
            configs = list(dataset_info.config_names)
            # Sort configs to get the latest (assuming YYYY-MM format)
            configs.sort(reverse=True)
            return configs[0] if configs else None
        except:
            return None

    def _get_current_or_previous_month_config(self):
        """Get config name for current month, falling back to previous month if not available"""
        current_date = datetime.datetime.now()
        
        # Try current month first
        current_config = current_date.strftime("%Y-%m")
        
        # Check if current month config exists by trying to load a dataset
        try:
            dataset_name = self._get_dataset_name("items")
            load_dataset(dataset_name, current_config)
            return current_config
        except:
            # Fall back to previous month
            if current_date.month == 1:
                previous_month = current_date.replace(year=current_date.year-1, month=12)
            else:
                previous_month = current_date.replace(month=current_date.month-1)
            
            previous_config = previous_month.strftime("%Y-%m")
            
            # Try previous month
            try:
                load_dataset(dataset_name, previous_config)
                return previous_config
            except:
                # Final fallback: get the latest available config
                return self._get_latest_config_name(dataset_name)

    def get_items(self):
        """Get items from the items dataset"""
        config_name = self._get_current_or_previous_month_config()
        data = self._load_dataset_as_dict_list("items", config_name)
        return data

    def get_indications(self):
        """Get indications from the indications dataset"""
        config_name = self._get_current_or_previous_month_config()
        data = self._load_dataset_as_dict_list("indications", config_name)
        return data

    def get_prescribing_texts(self):
        """Get prescribing texts from the prescribing-texts dataset"""
        config_name = self._get_current_or_previous_month_config()
        data = self._load_dataset_as_dict_list("prescribing-texts", config_name)
        return data

    def get_item_prescribing_text_relationships(self):
        """Get item-prescribing-text relationships"""
        config_name = self._get_current_or_previous_month_config()
        data = self._load_dataset_as_dict_list("item-prescribing-text-relationships", config_name)
        return data

    def get_restrictions(self):
        """Get restrictions from the restrictions dataset"""
        config_name = self._get_current_or_previous_month_config()
        data = self._load_dataset_as_dict_list("restrictions", config_name)
        return data

    def get_item_restriction_relationships(self):
        """Get item-restriction relationships"""
        config_name = self._get_current_or_previous_month_config()
        data = self._load_dataset_as_dict_list("item-restriction-relationships", config_name)
        return data

    def get_restriction_prescribing_text_relationships(self):
        """Get restriction-prescribing-text relationships"""
        config_name = self._get_current_or_previous_month_config()
        data = self._load_dataset_as_dict_list("restriction-prescribing-text-relationships", config_name)
        return data

    def fetch_rheumatology_biologics_data(self):
        biologics = [
            "adalimumab", "etanercept", "infliximab", "certolizumab", "golimumab",
            "rituximab", "abatacept", "tocilizumab", "secukinumab", "ixekizumab",
            "ustekinumab", "guselkumab", "tofacitinib", "baricitinib", "secukinumab",
            "upadacitinib", "anifrolumab", "bimekizumab", "avacopan", "risankizumab"
        ]

        rheumatic_diseases = [
            "rheumatoid arthritis", "psoriatic arthritis", "ankylosing spondylitis",
            "non-radiographic axial spondyloarthritis", "giant cell arteritis", 
            "juvenile idiopathic arthritis", "systemic lupus erythematosus", "Anti-neutrophil cytoplasmic autoantibody (ANCA) associated vasculitis"
        ]

        data = {}
        
        # Get the config being used
        config_name = self._get_current_or_previous_month_config()
        print(f"Using dataset config: {config_name}")
        
        # Parse config to get year and month for metadata
        try:
            year, month = config_name.split('-')
            schedule_year = int(year)
            schedule_month = datetime.datetime.strptime(month, "%m").strftime("%B").upper()
        except:
            current_date = datetime.datetime.now()
            schedule_year = current_date.year
            schedule_month = current_date.strftime("%B").upper()

        print("Loading items...")
        items = self.get_items()

        print("Loading indications...")
        indications = self.get_indications()
        print(f"Number of indications loaded: {len(indications)}")
        print("Sample of raw indications data:")
        for indication in indications[:5]:
            print(indication)

        print("Loading prescribing texts...")
        prescribing_texts = self.get_prescribing_texts()

        print("Loading item-prescribing-text relationships...")
        item_prescribing_text_relationships = self.get_item_prescribing_text_relationships()

        print("Loading restrictions...")
        restrictions = self.get_restrictions()

        print("Loading item-restriction relationships...")
        item_restriction_relationships = self.get_item_restriction_relationships()

        print("Loading restriction-prescribing-text relationships...")
        restriction_prescribing_text_relationships = self.get_restriction_prescribing_text_relationships()
        print(f"Number of restriction-prescribing-text relationships loaded: {len(restriction_prescribing_text_relationships)}")

        # Create lookup dictionaries
        prescribing_text_lookup = {text['prescribing_txt_id']: text for text in prescribing_texts if 'prescribing_txt_id' in text}
        restriction_lookup = {res['res_code']: res for res in restrictions if 'res_code' in res}

        # Create indication lookup
        indication_lookup = {}
        for ind in indications:
            # Print all keys in the first indication to see available fields
            if not indication_lookup:
                print("Keys in indication data:", ind.keys())
            
            # Try different possible keys for the prescribing text ID
            prescribing_text_id = ind.get('prescribing_text_id') or ind.get('indication_prescribing_txt_id') or ind.get('prescribing_txt_id')
            if prescribing_text_id:
                indication_lookup[prescribing_text_id] = ind

        print(f"Number of items in indication_lookup: {len(indication_lookup)}")
        print("Sample of indication_lookup:")
        for key, value in list(indication_lookup.items())[:5]:
            print(f"  {key}: {value}")

        # Create a lookup for item-prescribing-text relationships
        item_prescribing_text_lookup = {}
        for relationship in item_prescribing_text_relationships:
            pbs_code = relationship.get('pbs_code')
            prescribing_txt_id = relationship.get('prescribing_txt_id')
            if pbs_code and prescribing_txt_id:
                if pbs_code not in item_prescribing_text_lookup:
                    item_prescribing_text_lookup[pbs_code] = []
                item_prescribing_text_lookup[pbs_code].append(prescribing_txt_id)

        # Create a lookup for restriction-prescribing-text relationships
        restriction_prescribing_text_lookup = {}
        print("\nDebugging restriction-prescribing-text relationships:")
        print("Full structure of first 5 relationships:")
        for relationship in restriction_prescribing_text_relationships[:5]:
            print(relationship)

        for relationship in restriction_prescribing_text_relationships:
            res_code = relationship.get('res_code')
            prescribing_text_id = relationship.get('prescribing_text_id')
            if res_code and prescribing_text_id:
                if res_code not in restriction_prescribing_text_lookup:
                    restriction_prescribing_text_lookup[res_code] = []
                restriction_prescribing_text_lookup[res_code].append(prescribing_text_id)

        print(f"Number of items in restriction_prescribing_text_lookup: {len(restriction_prescribing_text_lookup)}")
        print("Sample of restriction_prescribing_text_lookup:")
        for key, value in list(restriction_prescribing_text_lookup.items())[:5]:
            print(f"  {key}: {value}")

        print("Debugging: Inspecting lookups")
        print(f"Number of items in prescribing_text_lookup: {len(prescribing_text_lookup)}")
        print(f"Number of items in restriction_lookup: {len(restriction_lookup)}")
        print(f"Number of items in indication_lookup: {len(indication_lookup)}")
        print(f"Number of items in item_prescribing_text_lookup: {len(item_prescribing_text_lookup)}")
        print(f"Number of items in restriction_prescribing_text_lookup: {len(restriction_prescribing_text_lookup)}")

        def classify_formulation(description):
            # Define keywords for each formulation type
            tablet_keywords = ['Tablet']
            pen_keywords = ['pen', 'auto-injector', 'autoinjector']
            syringe_keywords = ['syringe']
            infusion_keywords = ['I.V. infusion', 'Concentrate for injection']

            # Normalize the description to lowercase for case-insensitive matching
            desc_lower = description.lower()

            # Check for keywords and return the corresponding formulation type
            if any(keyword.lower() in desc_lower for keyword in tablet_keywords):
                return 'tablet'
            elif any(keyword.lower() in desc_lower for keyword in pen_keywords):
                return 'subcut pen'
            elif any(keyword.lower() in desc_lower for keyword in syringe_keywords):
                return 'subcut syringe'
            elif any(keyword.lower() in desc_lower for keyword in infusion_keywords):
                return 'infusion'
            else:
                return 'unknown'  # For cases that don't match any category

        def classify_hospital_type(program_code):
            if program_code == 'HS':
                return 'Private'
            elif program_code == 'HB':
                return 'Public'
            else:
                return 'Any'

        for item in items:
            if any(biologic.lower() in item['drug_name'].lower() for biologic in biologics):
                pbs_code = item['pbs_code']
                if pbs_code not in data:
                    data[pbs_code] = {
                        "schedule_code": config_name,
                        "schedule_year": schedule_year,
                        "schedule_month": schedule_month,
                        "name": item['drug_name'],
                        "brands": [],  # Change this to a list
                        "formulation": classify_formulation(item['li_form']),
                        "li_form": item['li_form'],
                        "schedule_form": item['schedule_form'],
                        "manner_of_administration": item['manner_of_administration'],
                        "maximum_prescribable_pack": item['maximum_prescribable_pack'],
                        "maximum_quantity": item['maximum_quantity_units'],
                        "number_of_repeats": item['number_of_repeats'],
                        "hospital_type": classify_hospital_type(item['program_code']),
                        "restrictions": []
                    }
                # Append the brand name if it's not already in the list
                if item['brand_name'] not in data[pbs_code]['brands']:
                    data[pbs_code]['brands'].append(item['brand_name'])

        for pbs_code in list(data.keys()):
            for relationship in item_restriction_relationships:
                if relationship.get('pbs_code') == pbs_code:
                    res_code = relationship.get('res_code')
                    restriction = restriction_lookup.get(res_code)
                    if restriction:
                        prescribing_text_ids = restriction_prescribing_text_lookup.get(res_code, [])
                        for prescribing_text_id in prescribing_text_ids:
                            indication = indication_lookup.get(prescribing_text_id)
                            if indication:
                                condition = indication.get('condition', '').lower()
                                found_indication = next((disease for disease in rheumatic_diseases if disease.lower() in condition), None)
                                if found_indication:
                                    restriction_data = {
                                        'res_code': res_code,
                                        'indications': found_indication,
                                        'treatment_phase': restriction.get('treatment_phase', ''),
                                        'restriction_text': restriction.get('li_html_text', ''),
                                        'authority_method': restriction.get('authority_method', ''),
                                        'streamlined_code': restriction.get('treatment_of_code') if restriction.get('authority_method') == "STREAMLINED" else None,
                                        'online_application': "HOBART TAS 7001" not in restriction.get('schedule_html_text', '')
                                    }
                                    data[pbs_code]['restrictions'].append(restriction_data)
                                    break  # Stop after finding the first matching indication

        # Drop entries if restrictions are empty
        data = {k: v for k, v in data.items() if v['restrictions']}
        return data

    def preprocess_data(self, data):
        processed = {
            'combinations': []
        }
        
        for pbs_code, item in data.items():
            for restriction in item['restrictions']:
                for brand in item['brands']:
                    processed['combinations'].append({
                        'pbs_code': pbs_code,
                        'drug': item['name'],
                        'brand': brand,
                        'formulation': item['li_form'],
                        'indication': restriction['indications'],
                        'treatment_phase': restriction['treatment_phase'],
                        'streamlined_code': restriction['streamlined_code'],
                        'online_application': restriction['online_application'],
                        'authority_method': restriction['authority_method'],
                        'hospital_type': item['hospital_type'],
                        'maximum_prescribable_pack': item['maximum_prescribable_pack'],
                        'maximum_quantity_units': item['maximum_quantity'],
                        'number_of_repeats': item['number_of_repeats'],
                        'schedule_code': item['schedule_code'],
                        'schedule_year': item['schedule_year'],
                        'schedule_month': item['schedule_month']
                    })
        
        return processed

    def save_data_to_hf(self, data, hf_token=None, dataset_name="cmcmaster/rheumatology-biologics-dataset"):
        processed_data = self.preprocess_data(data)
        
        # Get the schedule code for the current data
        current_schedule_code = None
        if processed_data['combinations']:
            current_schedule_code = processed_data['combinations'][0]['schedule_code']
        
        if not current_schedule_code:
            print("No data to upload - processed data is empty")
            return
        
        print(f"Checking for existing data for schedule: {current_schedule_code}")
        
        # Try to load existing dataset
        existing_data = []
        try:
            print(f"Loading existing dataset: {dataset_name}")
            existing_dataset = load_dataset(dataset_name, split='train')
            existing_data = existing_dataset.to_pandas().to_dict('records')
            print(f"Found existing dataset with {len(existing_data)} rows")
            
            # Check if current schedule already exists
            existing_schedule_codes = set(row.get('schedule_code') for row in existing_data)
            if current_schedule_code in existing_schedule_codes:
                print(f"Schedule {current_schedule_code} already exists in dataset. Skipping upload to avoid duplicates.")
                return
            else:
                print(f"Schedule {current_schedule_code} not found in existing data. Will append new data.")
                
        except Exception as e:
            print(f"Could not load existing dataset (may not exist yet): {e}")
            print("Creating new dataset...")
        
        # Combine existing data with new data
        all_combinations = existing_data + processed_data['combinations']
        print(f"Total rows after combining: {len(all_combinations)} (existing: {len(existing_data)}, new: {len(processed_data['combinations'])})")
        
        # Create a Dataset from the combined data
        dataset = Dataset.from_list(all_combinations)
        
        # Push the dataset to the Hugging Face Hub
        try:
            if hf_token:
                dataset.push_to_hub(dataset_name, token=hf_token)
            else:
                dataset.push_to_hub(dataset_name)
            
            print(f"Data successfully saved to Hugging Face Hub: {dataset_name}")
            print(f"Added {len(processed_data['combinations'])} new rows for schedule {current_schedule_code}")
        except Exception as e:
            print(f"Error saving to Hugging Face Hub: {e}")
            raise

def main():
    parser = argparse.ArgumentParser(description="Process PBS datasets to extract rheumatology biologics data")
    parser.add_argument("--source-repo-id", type=str, default="cmcmaster/pbs", 
                       help="The base Hugging Face Hub repository ID where PBS datasets are stored")
    parser.add_argument("--output-dataset", type=str, default="cmcmaster/rheumatology-biologics-dataset-monthly",
                       help="The output dataset name for the processed biologics data")
    
    args = parser.parse_args()
    
    client = PBSDatasetClient(base_repo_id=args.source_repo_id)

    try:
        print(f"Loading data from {args.source_repo_id} on biologics used for rheumatological diseases...")
        data = client.fetch_rheumatology_biologics_data()
        
        print(f"Data loaded for {len(data)} items.")
        
        # Get HF token from environment if available
        hf_token = os.getenv("HF_TOKEN")
        client.save_data_to_hf(data, hf_token=hf_token, dataset_name=args.output_dataset)
        print(f"Data saved to Hugging Face Hub: {args.output_dataset}")

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()