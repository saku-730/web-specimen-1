// src/components/create/OccurrenceForm.tsx

"use client"; // ユーザーの入力を扱うので、クライアントコンポーネントにするのだ！

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import InputField from "./InputField"; // さっき作った部品をインポート
import Cookies from 'js-cookie';

// 型定義（本当は src/types/create.ts に分けると綺麗）
type DropdownOptions = {
  users: { user_id: number; user_name: string }[];
  projects: { project_id: number; project_name: string }[];
  languages: { language_id: number; language_common: string }[];
  observation_methods: { observation_method_id: number; observation_method_name: string }[];
  specimen_methods: { specimen_methods_id: number; specimen_methods_common: string }[];
  institutions: { institution_id: number; institution_code: string }[];
};

const OccurrenceForm = () => {
  const [formData, setFormData] = useState<any>({}); // フォーム全体の入力値
  const [dropdowns, setDropdowns] = useState<DropdownOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ページ読み込み時に、GET APIからドロップダウンとデフォルト値を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/create`;
        
	const token = Cookies.get('token');

	if (!token) throw new Error("Authentication token not found. Please login again.");

	const res = await fetch(apiUrl, {
          headers: { 
            "Authorization": `Bearer ${token}` // ⬅️ これで正しいトークンが送られる
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized: Please login again.");
          throw new Error("Failed to fetch initial data");
        }
        
        const data = await res.json();
        setDropdowns(data.dropdown_list);
        if (data.default_value) {
          setFormData(data.default_value);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // []が空なので、最初の1回だけ実行される

  // フォームの入力値が変わるたびに、formDataを更新する
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    const parsedValue = e.target.type === 'number' && value !== '' ? parseFloat(value) : value;

    if (keys.length > 1) {
      // "classification.species" のようなネストされた入力に対応
      setFormData((prev: any) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: parsedValue
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: parsedValue
      }));
    }
  };
  
  // フォーム送信（POST）の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページの再読み込みを防ぐ
    
    try {
      const payload: any = {}; // 送信用の「公式書類」

      // --- 1. バリデーション：必須項目をチェック ---
      if (!formData.user_id || parseInt(String(formData.user_id), 10) <= 0) {
        alert("User is a required field.");
        return;
      }
      payload.user_id = parseInt(String(formData.user_id), 10);

      // --- 2. 任意項目をチェックして、正しい型でpayloadに追加 ---
      if (formData.project_id) payload.project_id = parseInt(String(formData.project_id), 10);
      if (formData.created_at) payload.created_at = new Date(formData.created_at).toISOString();
      if (formData.language_id) payload.language_id = parseInt(String(formData.language_id), 10);
      if (formData.latitude) payload.latitude = parseFloat(String(formData.latitude));
      if (formData.longitude) payload.longitude = parseFloat(String(formData.longitude));
      if (formData.individual_id) payload.individual_id = parseInt(String(formData.individual_id), 10);
      if (formData.lifestage) payload.lifestage = formData.lifestage;
      if (formData.sex) payload.sex = formData.sex;
      if (formData.body_length) payload.body_length = formData.body_length;
      if (formData.place_name) payload.place_name = formData.place_name;
      if (formData.note) payload.note = formData.note;

      // --- 3. ネストされたオブジェクトも、送信に必要な項目だけ選んで作る ---
      if (formData.classification && Object.values(formData.classification).some(v => v)) {
        payload.classification = formData.classification;
      }
      if (formData.observation && Object.values(formData.observation).some(v => v)) {
        payload.observation = {
          observation_method_id: formData.observation.observation_method_id ? parseInt(String(formData.observation.observation_method_id), 10) : undefined,
          behavior: formData.observation.behavior,
          observed_at: formData.observation.observed_at ? new Date(formData.observation.observed_at).toISOString() : undefined,
          observation_user_id: formData.observation.observation_user_id ? parseInt(String(formData.observation.observation_user_id), 10) : undefined,
        };
      }
      if (formData.specimen && Object.values(formData.specimen).some(v => v)) {
        payload.specimen = {
          specimen_user_id: formData.specimen.specimen_user_id ? parseInt(String(formData.specimen.specimen_user_id), 10) : undefined,
          specimen_methods_id: formData.specimen.specimen_methods_id ? parseInt(String(formData.specimen.specimen_methods_id), 10) : undefined,
          created_at: formData.specimen.created_at ? new Date(formData.specimen.created_at).toISOString() : undefined,
          institution_id: formData.specimen.institution_id ? parseInt(String(formData.specimen.institution_id), 10) : undefined,
          collection_id: formData.specimen.collection_id,
        };
      }
      if (formData.identification && Object.values(formData.identification).some(v => v)) {
        payload.identification = {
            identification_user_id: formData.identification.identification_user_id ? parseInt(String(formData.identification.identification_user_id), 10) : undefined,
            identified_at: formData.identification.identified_at ? new Date(formData.identification.identified_at).toISOString() : undefined,
            source_info: formData.identification.source_info,
        };
      }

      // --- 4. 完成したpayloadを送信する ---
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/create`;

      const token = Cookies.get('token');
      if (!token) throw new Error("Authentication token not found. Please login again.");

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit data");
      }
      
      const result = await res.json();
      alert("Success! Created Occurrence ID: " + result.OccurrenceID);
      // 詳細ページにリダイレクト
      router.push(`/occurrences/${result.OccurrenceID}`); 

    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div>Loading form...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // 日付のフォーマットをdatetime-localのvalueに合わせるヘルパー関数
  const formatDateTimeLocal = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-gray-800">

      {/* --- 基本情報セクション --- */}
      <div className="border-b pb-8">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="User" id="user_id" name="user_id" type="select" value={formData.user_id || ''} onChange={handleChange} options={dropdowns?.users.map(u => ({ value: u.user_id, label: u.user_name }))} />
          <InputField label="Project" id="project_id" name="project_id" type="select" value={formData.project_id || ''} onChange={handleChange} options={dropdowns?.projects.map(p => ({ value: p.project_id, label: p.project_name }))} />
          <InputField label="Individual ID" id="individual_id" name="individual_id" type="number" value={formData.individual_id || ''} onChange={handleChange} />
          <InputField label="Lifestage" id="lifestage" name="lifestage" type="text" value={formData.lifestage || ''} onChange={handleChange} />
          <InputField label="Sex" id="sex" name="sex" type="select" value={formData.sex || ''} onChange={handleChange} options={[{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}, {value: 'unknown', label: 'Unknown'}]} />
          <InputField label="Body Length" id="body_length" name="body_length" type="text" value={formData.body_length || ''} onChange={handleChange} placeholder="e.g., 100mm" />
          <InputField label="Language" id="language_id" name="language_id" type="select" value={formData.language_id || ''} onChange={handleChange} options={dropdowns?.languages.map(l => ({ value: l.language_id, label: l.language_common }))} />
          <InputField label="Date Created" id="created_at" name="created_at" type="datetime-local" value={formatDateTimeLocal(formData.created_at)} onChange={handleChange} />
        </div>
      </div>

      {/* --- 場所セクション --- */}
      <div className="border-b pb-8">
        <h2 className="text-lg font-semibold mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="Latitude" id="latitude" name="latitude" type="number" value={formData.latitude || ''} onChange={handleChange} step="any" />
          <InputField label="Longitude" id="longitude" name="longitude" type="number" value={formData.longitude || ''} onChange={handleChange} step="any" />
          <InputField label="Place Name" id="place_name" name="place_name" type="text" value={formData.place_name || ''} onChange={handleChange} />
        </div>
      </div>

      {/* --- 分類セクション --- */}
      <div className="border-b pb-8">
        <h2 className="text-lg font-semibold mb-4">Classification</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField label="Kingdom" id="classification.kingdom" name="classification.kingdom" type="text" value={formData.classification?.kingdom || ''} onChange={handleChange} />
          <InputField label="Phylum" id="classification.phylum" name="classification.phylum" type="text" value={formData.classification?.phylum || ''} onChange={handleChange} />
          <InputField label="Class" id="classification.class" name="classification.class" type="text" value={formData.classification?.class || ''} onChange={handleChange} />
          <InputField label="Order" id="classification.order" name="classification.order" type="text" value={formData.classification?.order || ''} onChange={handleChange} />
          <InputField label="Family" id="classification.family" name="classification.family" type="text" value={formData.classification?.family || ''} onChange={handleChange} />
          <InputField label="Genus" id="classification.genus" name="classification.genus" type="text" value={formData.classification?.genus || ''} onChange={handleChange} />
          <InputField label="Species" id="classification.species" name="classification.species" type="text" value={formData.classification?.species || ''} onChange={handleChange} />
          <InputField label="Others" id="classification.others" name="classification.others" type="text" value={formData.classification?.others || ''} onChange={handleChange} />
        </div>
      </div>

      {/* --- 観察セクション --- */}
      <div className="border-b pb-8">
        <h2 className="text-lg font-semibold mb-4">Observation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="Observer" id="observation.observation_user_id" name="observation.observation_user_id" type="select" value={formData.observation?.observation_user_id || ''} onChange={handleChange} options={dropdowns?.users.map(u => ({ value: u.user_id, label: u.user_name }))} />
          <InputField label="Observation Method" id="observation.observation_method_id" name="observation.observation_method_id" type="select" value={formData.observation?.observation_method_id || ''} onChange={handleChange} options={dropdowns?.observation_methods.map(m => ({ value: m.observation_method_id, label: m.observation_method_name }))} />
          <InputField label="Observed At" id="observation.observed_at" name="observation.observed_at" type="datetime-local" value={formatDateTimeLocal(formData.observation?.observed_at)} onChange={handleChange} />
        </div>
        <div className="mt-4">
          <InputField label="Behavior" id="observation.behavior" name="observation.behavior" type="textarea" value={formData.observation?.behavior || ''} onChange={handleChange} />
        </div>
      </div>
      
      {/* --- 標本セクション --- */}
      <div className="border-b pb-8">
        <h2 className="text-lg font-semibold mb-4">Specimen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="specimen-maker" id="specimen.specimen_user_id" name="specimen.specimen_user_id" type="select" value={formData.specimen?.specimen_user_id || ''} onChange={handleChange} options={dropdowns?.users.map(u => ({ value: u.user_id, label: u.user_name }))} />
          <InputField label="Specimen Method" id="specimen.specimen_methods_id" name="specimen.specimen_methods_id" type="select" value={formData.specimen?.specimen_methods_id || ''} onChange={handleChange} options={dropdowns?.specimen_methods.map(m => ({ value: m.specimen_methods_id, label: m.specimen_methods_common }))} />
          <InputField label="Institution" id="specimen.institution_id" name="specimen.institution_id" type="select" value={formData.specimen?.institution_id || ''} onChange={handleChange} options={dropdowns?.institutions.map(i => ({ value: i.institution_id, label: i.institution_code }))} />
          <InputField label="Collection ID" id="specimen.collection_id" name="specimen.collection_id" type="text" value={formData.collection_id || ''} onChange={handleChange} />
          <InputField label="Date Prepared" id="specimen.created_at" name="specimen.created_at" type="datetime-local" value={formatDateTimeLocal(formData.specimen?.created_at)} onChange={handleChange} />
        </div>
      </div>

      {/* --- 同定セクション --- */}
      <div className="border-b pb-8">
        <h2 className="text-lg font-semibold mb-4">Identification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Identifier" id="identification.identification_user_id" name="identification.identification_user_id" type="select" value={formData.identification?.identification_user_id || ''} onChange={handleChange} options={dropdowns?.users.map(u => ({ value: u.user_id, label: u.user_name }))} />
          <InputField label="Date Identified" id="identification.identified_at" name="identification.identified_at" type="datetime-local" value={formatDateTimeLocal(formData.identification?.identified_at)} onChange={handleChange} />
        </div>
        <div className="mt-4">
          <InputField label="Source Info" id="identification.source_info" name="identification.source_info" type="textarea" value={formData.identification?.source_info || ''} onChange={handleChange} />
        </div>
      </div>
      
      {/* --- ノートセクション --- */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Note</h2>
        <InputField label="Note" id="note" name="note" type="textarea" value={formData.note || ''} onChange={handleChange} rows={4} />
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Create Occurrence
        </button>
      </div>
    </form>
  );
};

export default OccurrenceForm;
