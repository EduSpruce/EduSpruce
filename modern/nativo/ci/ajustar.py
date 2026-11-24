#!/usr/bin/env python3
"""Acertos aos projetos nativos gerados pelo Capacitor (corre depois de «cap add»):
   · Android: abrir ligações spruceit://… e https://eduspruce.pt/spruceit na app
   · iOS: texto do pedido de câmara (leitor de QR), esquema spruceit:// e só retrato no iPhone"""
import os,re,sys,plistlib
AQUI=os.path.dirname(os.path.abspath(__file__));RAIZ=os.path.dirname(AQUI)
def android():
    p=os.path.join(RAIZ,'android/app/src/main/AndroidManifest.xml')
    if not os.path.exists(p):return
    s=open(p,encoding='utf-8').read()
    if 'android:scheme="spruceit"' in s:return
    filtro='''
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="spruceit" />
            </intent-filter>
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="eduspruce.pt" android:pathPrefix="/spruceit" />
            </intent-filter>
'''
    s=re.sub(r'(<activity[^>]*MainActivity[\s\S]*?</intent-filter>)',lambda m:m.group(1)+filtro,s,count=1)
    if 'android.permission.CAMERA' not in s:s=s.replace('<application','<uses-permission android:name="android.permission.CAMERA" />\n    <application',1)
    if 'com.google.mlkit.vision.DEPENDENCIES' not in s:s=s.replace('</application>','    <meta-data android:name="com.google.mlkit.vision.DEPENDENCIES" android:value="barcode_ui"/>\n    </application>',1)
    open(p,'w',encoding='utf-8').write(s);print('Android: ligações acrescentadas')
def ios():
    pf=os.path.join(RAIZ,'ios/App/Podfile')
    if os.path.exists(pf):
        t=open(pf).read();t=re.sub(r"platform :ios, *'[0-9.]+'","platform :ios, '15.5'",t);open(pf,'w').write(t)
    px=os.path.join(RAIZ,'ios/App/App.xcodeproj/project.pbxproj')
    if os.path.exists(px):
        t=open(px).read();t=re.sub(r'IPHONEOS_DEPLOYMENT_TARGET = [0-9.]+;','IPHONEOS_DEPLOYMENT_TARGET = 15.5;',t);open(px,'w').write(t)
    p=os.path.join(RAIZ,'ios/App/App/Info.plist')
    if not os.path.exists(p):return
    with open(p,'rb') as f:d=plistlib.load(f)
    d['NSCameraUsageDescription']='A câmara serve só para ler o código QR do jogo.'
    d['CFBundleDisplayName']='Spruce It!'
    d['CFBundleURLTypes']=[{'CFBundleURLName':'app.eduspruce.spruceit','CFBundleURLSchemes':['spruceit']}]
    d['UISupportedInterfaceOrientations']=['UIInterfaceOrientationPortrait']
    d['ITSAppUsesNonExemptEncryption']=False
    with open(p,'wb') as f:plistlib.dump(d,f)
    print('iOS: Info.plist acertado')
android();ios()
